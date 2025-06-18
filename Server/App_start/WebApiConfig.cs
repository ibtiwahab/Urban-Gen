using System.Web.Http;

namespace WebServer
{
    public class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.MapHttpAttributeRoutes();
            config.Routes.MapHttpRoute(
                name: "Main",
                routeTemplate: "api/{controller}/{action}"
            );
        }
    }
}
