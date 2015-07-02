using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using MsgBoard.mdl;

namespace MsgBoard.web.api
{
    public class TopicReviewsController : ApiController
    {
        private MessageBoardContext db = new MessageBoardContext();

        // GET: api/TopicReviews
        public IQueryable<TopicReview> GetReviews()
        {
            return db.Reviews;
        }

        // GET: api/TopicReviews/5
        [ResponseType(typeof(TopicReview))]
        public IHttpActionResult GetTopicReview(int id)
        {
            TopicReview topicReview = db.Reviews.Find(id);
            if (topicReview == null)
            {
                return NotFound();
            }

            return Ok(topicReview);
        }

        // PUT: api/TopicReviews/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutTopicReview(int id, TopicReview topicReview)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != topicReview.id)
            {
                return BadRequest();
            }

            db.Entry(topicReview).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TopicReviewExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/TopicReviews
        [ResponseType(typeof(TopicReview))]
        public IHttpActionResult PostTopicReview(TopicReview topicReview)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Reviews.Add(topicReview);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = topicReview.id }, topicReview);
        }

        // DELETE: api/TopicReviews/5
        [ResponseType(typeof(TopicReview))]
        public IHttpActionResult DeleteTopicReview(int id)
        {
            TopicReview topicReview = db.Reviews.Find(id);
            if (topicReview == null)
            {
                return NotFound();
            }

            db.Reviews.Remove(topicReview);
            db.SaveChanges();

            return Ok(topicReview);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool TopicReviewExists(int id)
        {
            return db.Reviews.Count(e => e.id == id) > 0;
        }
    }
}