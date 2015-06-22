using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MsgBoard.mdl
{
    public class MessageBoardRepository : IMessageBoardRepository
    {
        private MessageBoardContext ctx;
        public MessageBoardRepository(MessageBoardContext context)
        {
            ctx = context;
        }

        public bool AddReply(Reply reply)
        {
            ctx.Replies.Add(reply);
            return true;
        }

        public bool AddTopic(Topic topic)
        {
            ctx.Topics.Add(topic);
            return true;
        }

        public bool UpdateTopic(Topic topic)
        {
            var oldTopic = ctx.Topics.Where(x => x.Id == topic.Id).FirstOrDefault();
            oldTopic.Body = topic.Body;
            oldTopic.Title = topic.Title;
            ctx.Entry(oldTopic).State = System.Data.Entity.EntityState.Modified;
            return true;
        }

        public IQueryable<Reply> GetRepliesByTopic(int topicId)
        {
            var replies = ctx.Replies.Where(x => x.Id == topicId);
            return replies;
        }

        public IQueryable<Topic> GetTopics()
        {
            return ctx.Topics;
        }

        public IQueryable<Topic> GetTopicsIncludingReplies()
        {
            return ctx.Topics.Include("Replies");
        }

        public bool Save()
        {
            try
            {
                return ctx.SaveChanges() > 0;
            }
            catch (Exception)
            {


                return false;
            }
        }

        public bool DeleteTopic(int topicId)
        {
            
            var t = ctx.Topics.Where(x => x.Id == topicId).First();
            ctx.Topics.Remove(t);
            return true;

        }

     
    }
}
