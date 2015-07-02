using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MsgBoard.mdl
{
  public  class counter
    {
   
        public int Count { get; set; }

         
       
        public void decrease()
        {
            Count--;
        }

        public void increase()
        {
            Count++;
        }

        
    }
}
