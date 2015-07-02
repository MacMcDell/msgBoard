using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using MsgBoard.mdl;
using System.Web.Http.Description;
using System.Threading.Tasks;
using MsgBoard.web.Hubs;


namespace MsgBoard.web.Controllers
{
    public class ReviewsController : ApiControllerWithHub<MyHub>
    {
        private IReviewRepo _repo;
        public ReviewsController(IReviewRepo repo)
        {
            _repo = repo;
        }

        //  api/reviews
        public IEnumerable<TopicReview> GetTopicReviews()
        {
            return _repo.GetReviews();
        }


        //api/reviews/1
        [HttpGet]
        [ResponseType(typeof(TopicReview))]
        public IHttpActionResult GetReviews(int id)
        {
            var r = _repo.GetReviewsBySortId(id);
            return Ok(r);

        }



        [HttpPost]
        public HttpResponseMessage PostReview([FromBody]TopicReview newReview)
        {
            if (_repo.PostReview(newReview) && _repo.Save())
            {
                var subscribed = Hub.Clients.Group(newReview.sort.ToString());
                subscribed.addItem(newReview);
                return Request.CreateResponse(HttpStatusCode.Created, newReview);
            }



            return Request.CreateResponse(HttpStatusCode.BadRequest);
        }

        [HttpDelete]
        public HttpResponseMessage DeleteReview(int id)
        {
            var review = _repo.GetReviews().Where(x => x.id == id).Single(); 
            if (_repo.DeleteReview(id) && _repo.Save())
            {
                var subscribed = Hub.Clients.Group(review.sort.ToString());
                subscribed.deleteItem(review);
                return Request.CreateResponse(HttpStatusCode.Created, id);
            }



            return Request.CreateResponse(HttpStatusCode.BadRequest);

        }

    }
}
