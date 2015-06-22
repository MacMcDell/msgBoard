
using System.Linq;

namespace MsgBoard.mdl
{
    public interface IMessageBoardRepository
    {
        IQueryable<Topic> GetTopics();
        IQueryable<Topic> GetTopicsIncludingReplies();
        IQueryable<Reply> GetRepliesByTopic(int topicId);

        bool Save();
        bool AddTopic(Topic topic);
        bool UpdateTopic(Topic topic);
        bool DeleteTopic(int topicId);
        bool AddReply(Reply reply);




    }

}
