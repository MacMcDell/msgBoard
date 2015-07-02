using System;
using System.Collections.Generic;
using System.Data.Entity.Migrations;
using System.Linq;

namespace MsgBoard.mdl
{
    public class MessageBoardsMigrationConfiguration : DbMigrationsConfiguration<MessageBoardContext>
    {
        public MessageBoardsMigrationConfiguration()
        {
            this.AutomaticMigrationDataLossAllowed = true;
            this.AutomaticMigrationsEnabled = true;
        }

        protected override void Seed(MessageBoardContext context)
        {
            base.Seed(context);
#if DEBUG
            if (context.Topics.Count() == 0)
            {
                var topic = new Topic()
                {
                    Title = "Title 1",
                    Created = DateTime.Now,
                    Body = "I am a body created at " + DateTime.Now.ToShortDateString(),
                    Replies = new List<Reply>()
                    {
                        new Reply()
                        {
                            Body = "reply 1",
                            Created = DateTime.Now
                        },
                        new Reply()
                        {
                            Body = "reploy 2",
                            Created = DateTime.Now
                        },
                        new Reply()
                        {
                            Body = "reploy 3",
                            Created = DateTime.Now
                        }
                    }
                };
                context.Topics.Add(topic);



                try
                {
                    context.SaveChanges();
                }
                catch (Exception exception)
                {
                    var msg = exception.Message;

                }

#endif
            }

            if (!context.Reviews.Any())
            {
                var r = new List<TopicReview>()
                {
                    new TopicReview {sort = 1, review="xx" },
                          new TopicReview {sort = 1, review="xx" },
                                new TopicReview {sort = 1, review="xx" },
                                      new TopicReview {sort = 1, review="xx" }
                };
                context.Reviews.AddRange(r);
                context.SaveChanges();
            }
        }
    }
}