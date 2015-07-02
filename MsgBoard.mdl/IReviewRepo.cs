using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MsgBoard.mdl
{
  public interface IReviewRepo
    {
         IQueryable<TopicReview> GetReviews();
        IQueryable<TopicReview> GetReviewsBySortId(int id); 
         bool PostReview(TopicReview review);
        bool DeleteReview(int id);
        bool Save(); 

    }
}
