using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using MsgBoard.mdl;
using System.Web.Http.Description;
using System.Threading.Tasks;

namespace MsgBoard.web.Controllers
{
    public class TopicsController : ApiController
    {
        private IMessageBoardRepository _repo;

        public TopicsController(IMessageBoardRepository repo)
        {
            _repo = repo;
        }
        public IEnumerable<Topic> Get(bool includeReplies = false)
        {
            IQueryable<Topic> results = includeReplies ? _repo.GetTopicsIncludingReplies() : _repo.GetTopics();

            return results
            .OrderByDescending(t => t.Created).Take(50);
        }

        [HttpPost]
        public HttpResponseMessage Post([FromBody] Topic newTopic)
        {
            if (newTopic.Created == default(DateTime))
                newTopic.Created = DateTime.UtcNow;

            if (_repo.AddTopic(newTopic) && _repo.Save())
            {
                return Request.CreateResponse(HttpStatusCode.Created, newTopic);
            }
            return Request.CreateResponse(HttpStatusCode.BadRequest);
        }

      [HttpPut]
        public HttpResponseMessage Put([FromBody] Topic updatedTopic)
        {

            if (_repo.UpdateTopic(updatedTopic) && _repo.Save())
            {
                return Request.CreateResponse(HttpStatusCode.Created, updatedTopic);
            }
            return Request.CreateResponse(HttpStatusCode.BadRequest);

        }

        // DELETE: api/Topics/5
        //   [ResponseType(typeof(Topic))]
        //  public async Task<IHttpActionResult> DeleteTopic(int id)
        public HttpResponseMessage DeleteTopic(int id)
        {

            if (_repo.DeleteTopic(id) && _repo.Save())
            {
                return Request.CreateResponse(HttpStatusCode.Created, id);
            }
            return Request.CreateResponse(HttpStatusCode.BadRequest);

            //var db = new MessageBoardContext();
            //Topic topic = await db.Topics.FindAsync(id);
            //if (topic == null)
            //{
            //    return NotFound();
            //}

            //db.Topics.Remove(topic);
            //await db.SaveChangesAsync();

            //return Ok(topic);
        }

    }
}
