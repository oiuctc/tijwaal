/* =========================================================
   TIJWAAL – FIRESTORE SERVICE LAYER
   Shared CRUD functions for all pages.
   Requires: firebase-app-compat, firebase-auth-compat,
             firebase-firestore-compat, firebase-config.js
   ========================================================= */

const FirestoreService = {

    // ── User Profiles ─────────────────────────────────────
    async saveUserProfile(uid, data) {
        return firebaseDB.collection('users').doc(uid).set({
            ...data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    },

    async getUserProfile(uid) {
        const doc = await firebaseDB.collection('users').doc(uid).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    },

    // ── Service Requests ──────────────────────────────────
    async createServiceRequest(data) {
        const ref = await firebaseDB.collection('requests').add({
            ...data,
            status: 'open',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return ref.id;
    },

    async getRequest(requestId) {
        const doc = await firebaseDB.collection('requests').doc(requestId).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    },

    // Get all open requests (for providers)
    onOpenRequests(callback) {
        return firebaseDB.collection('requests')
            .where('status', '==', 'open')
            .orderBy('createdAt', 'desc')
            .onSnapshot(snapshot => {
                const requests = [];
                snapshot.forEach(doc => requests.push({ id: doc.id, ...doc.data() }));
                callback(requests);
            });
    },

    // ── Bids ──────────────────────────────────────────────
    async submitBid(requestId, bidData) {
        return firebaseDB.collection('requests').doc(requestId)
            .collection('bids').add({
                ...bidData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
    },

    // Real-time listener for bids on a request
    onBidsForRequest(requestId, callback) {
        return firebaseDB.collection('requests').doc(requestId)
            .collection('bids')
            .orderBy('amount', 'asc')
            .onSnapshot(snapshot => {
                const bids = [];
                snapshot.forEach(doc => bids.push({ id: doc.id, ...doc.data() }));
                callback(bids);
            });
    },

    // Accept a bid
    async acceptBid(requestId, bidId, providerData) {
        const batch = firebaseDB.batch();

        // Update request status
        const reqRef = firebaseDB.collection('requests').doc(requestId);
        batch.update(reqRef, {
            status: 'accepted',
            acceptedBidId: bidId,
            acceptedProviderId: providerData.providerId,
            acceptedProviderName: providerData.providerName,
            acceptedAmount: providerData.amount,
            acceptedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Update bid status
        const bidRef = reqRef.collection('bids').doc(bidId);
        batch.update(bidRef, { status: 'accepted' });

        return batch.commit();
    },

    // ── Provider Jobs ─────────────────────────────────────
    onProviderJobs(providerId, callback) {
        return firebaseDB.collection('requests')
            .where('acceptedProviderId', '==', providerId)
            .where('status', 'in', ['accepted', 'in_progress'])
            .onSnapshot(snapshot => {
                const jobs = [];
                snapshot.forEach(doc => jobs.push({ id: doc.id, ...doc.data() }));
                callback(jobs);
            });
    },

    async completeJob(requestId) {
        return firebaseDB.collection('requests').doc(requestId).update({
            status: 'completed',
            completedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    },

    // ── Provider Bids (for dashboard) ─────────────────────
    async getProviderBids(providerId) {
        const requestsSnap = await firebaseDB.collection('requests')
            .where('status', '==', 'open')
            .get();

        const myBids = [];
        for (const reqDoc of requestsSnap.docs) {
            const bidsSnap = await reqDoc.ref.collection('bids')
                .where('providerId', '==', providerId).get();
            bidsSnap.forEach(bidDoc => {
                myBids.push({
                    bidId: bidDoc.id,
                    ...bidDoc.data(),
                    requestId: reqDoc.id,
                    requestData: reqDoc.data()
                });
            });
        }
        return myBids;
    }
};

// ── Session helpers ───────────────────────────────────────
function saveSession(user) {
    sessionStorage.setItem('tijwaal_user', JSON.stringify(user));
}
function getSession() {
    const data = sessionStorage.getItem('tijwaal_user');
    return data ? JSON.parse(data) : null;
}
function clearSession() {
    sessionStorage.removeItem('tijwaal_user');
}

window.FirestoreService = FirestoreService;
window.saveSession = saveSession;
window.getSession = getSession;
window.clearSession = clearSession;
