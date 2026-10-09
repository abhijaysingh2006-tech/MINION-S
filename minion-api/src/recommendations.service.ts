interface UserInteractionMatrix {
  [userId: string]: { [trackId: string]: number }; // score: likes=5, full_plays=3, skips=-1
}

interface TrackFeatureVector {
  trackId: string;
  genreVector: { [genre: string]: number };
  tempoBpm: number;
  energy: number; // 0 to 1
}

/**
 * Hybrid Recommendation Engine for Minion.
 * Phase 1: Collaborative Filtering + Content-Based tags.
 * Designed with a pluggable adapter pattern to easily swap in an ML model (e.g. TensorFlow / TorchServe / Two-Tower embeddings).
 */
export class RecommendationEngine {
  /**
   * Calculates cosine similarity between two user listening preference vectors
   */
  private cosineSimilarity(vecA: { [key: string]: number }, vecB: { [key: string]: number }): number {
    const keysA = Object.keys(vecA);
    const keysB = Object.keys(vecB);
    const intersection = keysA.filter((k) => keysB.includes(k));

    if (intersection.length === 0) return 0;

    let dotProduct = 0;
    for (const key of intersection) {
      dotProduct += vecA[key] * vecB[key];
    }

    const magA = Math.sqrt(Object.values(vecA).reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(Object.values(vecB).reduce((sum, val) => sum + val * val, 0));

    if (magA === 0 || magB === 0) return 0;
    return dotProduct / (magA * magB);
  }

  /**
   * Collaborative Filtering: Recommends tracks liked by similar users
   */
  getCollaborativeRecommendations(
    targetUserId: string,
    userInteractions: UserInteractionMatrix,
    limit = 20
  ): string[] {
    const targetVector = userInteractions[targetUserId] || {};
    const similarities: { userId: string; score: number }[] = [];

    for (const otherUserId of Object.keys(userInteractions)) {
      if (otherUserId === targetUserId) continue;
      const sim = this.cosineSimilarity(targetVector, userInteractions[otherUserId]);
      if (sim > 0.1) {
        similarities.push({ userId: otherUserId, score: sim });
      }
    }

    // Sort users by similarity
    similarities.sort((a, b) => b.score - a.score);

    const candidateScores: { [trackId: string]: number } = {};
    for (const peer of similarities.slice(0, 10)) {
      const peerTracks = userInteractions[peer.userId];
      for (const [trackId, interactionWeight] of Object.entries(peerTracks)) {
        if (!targetVector[trackId]) {
          candidateScores[trackId] = (candidateScores[trackId] || 0) + peer.score * interactionWeight;
        }
      }
    }

    return Object.entries(candidateScores)
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .slice(0, limit)
      .map(([trackId]) => trackId);
  }

  /**
   * Content-Based Recommendation: Finds songs matching user's favorite genres/vibes
   */
  getContentBasedRecommendations(
    seedTrack: TrackFeatureVector,
    catalog: TrackFeatureVector[],
    limit = 20
  ): string[] {
    return catalog
      .filter((t) => t.trackId !== seedTrack.trackId)
      .map((t) => {
        let genreMatch = 0;
        for (const [genre, weight] of Object.entries(seedTrack.genreVector)) {
          if (t.genreVector[genre]) {
            genreMatch += weight * t.genreVector[genre];
          }
        }
        const energyDiff = 1 - Math.abs(t.energy - seedTrack.energy);
        const totalScore = genreMatch * 0.7 + energyDiff * 0.3;
        return { trackId: t.trackId, score: totalScore };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.trackId);
  }
}
