const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Fetch reviews for a specific shop or product
 */
export async function getReviews({ shopId, productId } = {}) {
  const params = new URLSearchParams();
  if (shopId) params.append('shopId', shopId);
  if (productId) params.append('productId', productId);

  try {
    const res = await fetch(`${API_BASE_URL}/reviews?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      return {
        reviews: data.reviews || [],
        reviewsCount: data.reviewsCount || 0,
        averageRating: data.averageRating || 4.8
      };
    }
  } catch {
    // Network fallback
  }

  return { reviews: [], reviewsCount: 0, averageRating: 4.8 };
}

/**
 * Submit a customer review (Authenticated)
 */
export async function createReview(reviewData, token) {
  if (!token) {
    return { success: false, error: 'You must be logged in to submit a review.' };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(reviewData)
    });

    const data = await res.json();
    if (res.ok) {
      return { success: true, review: data };
    }
    return { success: false, error: data.error || 'Failed to submit review.' };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

/**
 * Update an existing review (Authenticated author)
 */
export async function updateReview(reviewId, updateData, token) {
  if (!token) {
    return { success: false, error: 'You must be logged in to edit your review.' };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    const data = await res.json();
    if (res.ok) {
      return { success: true, review: data };
    }
    return { success: false, error: data.error || 'Failed to update review.' };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

/**
 * Delete a review (Authenticated author)
 */
export async function deleteReview(reviewId, token) {
  if (!token) {
    return { success: false, error: 'You must be logged in to delete your review.' };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    if (res.ok) {
      return { success: true, message: data.message };
    }
    return { success: false, error: data.error || 'Failed to delete review.' };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
}
