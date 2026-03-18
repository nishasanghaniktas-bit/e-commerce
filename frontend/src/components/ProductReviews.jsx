import { useState, useEffect } from "react";
import axios from "axios";
import { Star, Trash2 } from "lucide-react";
import { API_BASE } from "../../utils/apiBase";

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const token = JSON.parse(localStorage.getItem("currentUser"))?.token;

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/reviews/${productId}`
      );
      setReviews(res.data);
    } catch (error) {
      console.log("Error fetching reviews:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/reviews/${productId}/stats`
      );
      setStats(res.data);
    } catch (error) {
      console.log("Error fetching stats:", error);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("Please login to add review");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_BASE}/api/reviews/${productId}`,
        { productId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRating(5);
      setComment("");
      setShowForm(false);
      fetchReviews();
      fetchStats();
      alert("Review added successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add review");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;

    try {
      await axios.delete(
        `${API_BASE}/api/reviews/${productId}/${reviewId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchReviews();
      fetchStats();
      alert("Review deleted!");
    } catch (error) {
      alert("Failed to delete review");
    }
  };

  return (
    <div className="space-y-6">
      {/* Rating Stats */}
      {stats && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-500">
                {stats.averageRating}
              </div>
              <div className="flex justify-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.round(stats.averageRating) ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {stats.totalReviews} reviews
              </p>
            </div>

            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm w-8">{star}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{
                        width: `${stats.totalReviews > 0 
                          ? (stats.ratingDistribution[star] / stats.totalReviews) * 100 
                          : 0}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 w-8">
                    {stats.ratingDistribution[star]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Write a Review
            </button>
          )}
        </div>
      )}

      {/* Add Review Form */}
      {showForm && (
        <form onSubmit={handleAddReview} className="bg-white p-6 rounded-lg shadow space-y-4">
          <h4 className="font-bold">Share Your Review</h4>

          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    size={28}
                    className={star <= rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              rows="4"
            ></textarea>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post Review"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 border rounded-lg py-2 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No reviews yet</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold">{review.user?.name}</p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteReview(review._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <p className="text-gray-700">{review.comment}</p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
