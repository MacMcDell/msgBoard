using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;

namespace MsgBoard.web.Hubs
{
    public class MyHub : Hub
    {
        public void Subscribe(string topicId)
        {
            Groups.Add(Context.ConnectionId, topicId);
        }

        public void Unsubscribe(string topicId)
        {
            Groups.Remove(Context.ConnectionId, topicId);
        }
    }
}