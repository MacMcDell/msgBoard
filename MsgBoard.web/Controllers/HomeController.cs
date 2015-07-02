using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MsgBoard.mdl;

namespace MsgBoard.web.Controllers
{
    public class HomeController : Controller
    {

        IReviewRepo _repo;
        

        public HomeController(IReviewRepo repo)
        {
            _repo = repo;
           
        }

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        [HttpGet]
        public ActionResult Reviews()
        {
                    return View(); 


        }

        public ActionResult Counts()
        {

            counter c = new counter();
            
            c.Count = 1000; 
           
            return View(c); 

        }


        [HttpPost]
        public ActionResult Counts(counter Model, string submit)
        {
           
           
            switch (submit)
            {
                case "increase":
                    Model.increase();
                    break;
                default:
                    Model.decrease();
                    break;
            }
            ModelState.Clear();

            return View(Model);

        }
    
    }
}