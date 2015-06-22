using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using MsgBoard.mdl;

namespace MessageBoard.Controllers
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

    }
}
