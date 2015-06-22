using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(MsgBoard.web.Startup))]
namespace MsgBoard.web
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
