using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using MsgBoard.mdl;

namespace MsgBoard.web.Controllers
{
    public class RepliesController : ApiController
    {
        private IMessageBoardRepository _repo;

        //api/replies
        public RepliesController(IMessageBoardRepository repo)
        {
            _repo = repo;
        }

        //api/Replies/1
        public IEnumerable<Reply> Get(int topicId)
        {
            return _repo.GetRepliesByTopic(topicId);
        }

        //api/replies
        public HttpResponseMessage Post([FromBody] Reply newReply,int topicId)
        {
            if (newReply.Created == default(DateTime))
                newReply.Created = DateTime.UtcNow;

            newReply.TopicId = topicId;

            if (_repo.AddReply(newReply) && _repo.Save())
            {
                return Request.CreateResponse(HttpStatusCode.Created, newReply);
            }
            return Request.CreateResponse(HttpStatusCode.BadRequest);
        }

    }
}
