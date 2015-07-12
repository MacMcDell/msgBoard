using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MsgBoard.mdl
{
    public class ReviewRepo : IReviewRepo

    {
        private MessageBoardContext _ctx;
        public ReviewRepo(MessageBoardContext ctx)
        {
            _ctx = ctx;
        }

        public IQueryable<TopicReview> GetReviews()
        {
            return _ctx.Reviews;
        }


        public IQueryable<TopicReview> GetReviewsBySortId(int id)
        {
            return _ctx.Reviews.Where(x => x.sort == id);
        }

        public bool PostReview(TopicReview review)
        {
            _ctx.Reviews.Add(review);
            _ctx.SaveChanges();
            return true;
        }

        public bool DeleteReview(int id)
        {
            var review = _ctx.Reviews.Where(x => x.id == id).Single();
            _ctx.Reviews.Remove(review);
            return true;

        }

        public bool Save()
        {
            try
            {
                _ctx.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
            }

            return false;

        }

        public bool Update(TopicReview review)
        {
            var reviewToUpdate = _ctx.Reviews.Where(x => x.id == review.id).Single();
            reviewToUpdate.review = review.review;
            _ctx.Entry(reviewToUpdate).State = System.Data.Entity.EntityState.Modified;
            return true; 
        }
    }
}
