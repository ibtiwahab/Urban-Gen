using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web.Http;
using Newtonsoft.Json.Linq;
using Rhino.Geometry;
using Rhino3dmAddOn.Geometry;
using UrbanCity.Planning.UrbanDesign;

namespace WebServer.Controllers
{
    public class Response
    {
        public double[][] buildingLayersHeights { get; set; } = new double[][] { };
        public double[][][] buildingLayersVertices { get; set; } = new double[][][] { };
        public double[][] subSiteVertices { get; set; } = new double[][] { };
        public double[][] subSiteSetbackVertices { get; set; } = new double[][] { };
    }

    public class MainController : ApiController
    {
        protected static bool ValidateAndFillPlanFlattenedVertices(JObject jsonData, out List<double> flattenedVertices) {
            flattenedVertices = new List<double>();
            if (!jsonData.ContainsKey("plan_flattened_vertices")) return false;

            try
            {
                flattenedVertices = jsonData["plan_flattened_vertices"].ToObject<List<double>>();
                if (flattenedVertices.Count % 3 != 0 || flattenedVertices.Count < 9) return false;
            }
            catch { return false; }

            return true;
        }

        protected static void FillPlanParameters(JObject jsonData, SiteParameters planParameters)
        {
            if (jsonData.ContainsKey("plan_parameters"))
            {
                try
                {
                    int siteType = jsonData["plan_parameters"]["site_type"].ToObject<int>();
                    if (siteType >= 0 || siteType <= 4) planParameters.SetSiteType(siteType);
                }
                catch { }

                try
                {

                    double far = jsonData["plan_parameters"]["far"].ToObject<double>();

                    if (far >= 0.0 || far < 1.0)
                    {
                        double[] interval = SiteDataset.GetFarInterval((SiteTypes)planParameters.SiteType);
                        far = far * (interval[1] - interval[0]) + interval[0];
                        planParameters.SetSiteFar(far);
                    }
                }
                catch { }

                try
                {

                    double density = jsonData["plan_parameters"]["density"].ToObject<double>();

                    if (density >= 0.0 || density < 1.0)
                    {
                        double[] interval = SiteDataset.GetDensityInterval((SiteTypes)planParameters.SiteType);
                        density = density * (interval[1] - interval[0]) + interval[0];
                        planParameters.SetDensity(density);
                    }
                }
                catch { }

                try
                {
                    double mixRatio = jsonData["plan_parameters"]["mix_ratio"].ToObject<double>();
                    if (mixRatio >= 0.0 || mixRatio < 1.0) planParameters.SetMixRatio(mixRatio * 0.3);
                }
                catch { }

                try
                {
                    int buildingStyle = jsonData["plan_parameters"]["building_style"].ToObject<int>();
                    SiteTypes siteType = (SiteTypes)planParameters.SiteType;

                    if ((buildingStyle >= 0 && buildingStyle <= 2) || (
                        buildingStyle == 3 && (((SiteTypes)siteType) == SiteTypes.R || siteType == SiteTypes.M || siteType == SiteTypes.W)
                    )) planParameters.SetBuildingStyle(buildingStyle);
                }
                catch { }

                try
                {
                    double orientation = jsonData["plan_parameters"]["orientation"].ToObject<double>();
                    if (orientation >= 0.0 || orientation < 180) planParameters.SetRadiant(orientation * (Math.PI / 180));
                }
                catch { }
            }
        }

        [HttpPost]
        public async Task<IHttpActionResult> GeneratePlan()
        {
            string requestBody = await Request.Content.ReadAsStringAsync();
            JObject jsonData = JObject.Parse(requestBody);

            if (!ValidateAndFillPlanFlattenedVertices(jsonData, out List<double> flattenedVertices)) return InternalServerError(new Exception("Invalid vertices"));

            Polyline polyline = new Polyline();

            for (int i = 0; i < flattenedVertices.Count; i += 3)
            {
                polyline.Add(new Point3d(flattenedVertices[i], flattenedVertices[i + 1], flattenedVertices[i + 2]));
            }

            try
            {
                Curve curve = new PolylineCurve(polyline);
                SiteParameters[] planParameters = DesignToolbox.ComputeParameters(new Curve[] { curve }, new Curve[] { }, new double[] { }, 0.0001);
                FillPlanParameters(jsonData, planParameters[0]);

                string log = null;
                DesignResult[] siteResults = DesignToolbox.ComputingDesign(planParameters, 0, 0.0001, out _, out _, ref log);
                Response response = new Response();

                foreach (DesignResult siteResult in siteResults)
                {
                    foreach (BuildingGeometry[] subSiteResult in siteResult.SubSiteBuildingGeometries)
                    {
                        List<double[][]> buildingLayersVertices = new List<double[][]>();
                        List<double[]> buildingLayersHeights = new List<double[]>();

                        foreach (BuildingGeometry building in subSiteResult)
                        {
                            if (building.BuildingArea == 0)
                            {
                                continue;
                            }

                            List<double[]> LayerVertices = new List<double[]>();

                            foreach (Curve layer in building.Layers)
                            {
                                Polyline layerPolyline;
                                CurveAddOn.TryGetPolyline(layer, out layerPolyline);
                                List<double> flattendVertices = new List<double>();

                                foreach (Point3d point in layerPolyline)
                                {
                                    flattendVertices.Add(point.X);
                                    flattendVertices.Add(point.Y);
                                    flattendVertices.Add(point.Z);
                                }

                                LayerVertices.Add(flattendVertices.ToArray());
                            }

                            buildingLayersVertices.Add(LayerVertices.ToArray());

                            List<double> layersHeights = new List<double>();

                            for (int i = 0; i < (building.Layers.Length - 1); i++)
                            {
                                layersHeights.Add(building.Layers[i + 1].PointAtStart.Z - building.Layers[i].PointAtStart.Z);
                            }

                            layersHeights.Add(building.RoofCurves[0].PointAtStart.Z - building.Layers[building.Layers.Length - 1].PointAtStart.Z);
                            buildingLayersHeights.Add(layersHeights.ToArray());
                        }

                        response.buildingLayersVertices = response.buildingLayersVertices.Concat(buildingLayersVertices.ToArray()).ToArray();
                        response.buildingLayersHeights = response.buildingLayersHeights.Concat(buildingLayersHeights.ToArray()).ToArray();
                    }

                    List<double[]> subSiteVertices = new List<double[]>();

                    foreach (Curve subSite in siteResult.SubSites)
                    {
                        Polyline subSitePolyline;
                        CurveAddOn.TryGetPolyline(subSite, out subSitePolyline);
                        List<double> flattendVertices = new List<double>();

                        foreach (Point3d point in subSitePolyline)
                        {
                            flattendVertices.Add(point.X);
                            flattendVertices.Add(point.Y);
                            flattendVertices.Add(point.Z);
                        }

                        subSiteVertices.Add(flattendVertices.ToArray());
                    }

                    response.subSiteVertices = response.subSiteVertices.Concat(subSiteVertices.ToArray()).ToArray();

                    List<double[]> subSiteSetbackVertices = new List<double[]>();

                    foreach (Curve[] subSite in siteResult.SubSiteSetbacks)
                    {
                        foreach (Curve setback in subSite) {
                            Polyline setbackPolyline;
                            CurveAddOn.TryGetPolyline(setback, out setbackPolyline);
                            List<double> flattendVertices = new List<double>();

                            foreach (Point3d point in setbackPolyline)
                            {
                                flattendVertices.Add(point.X);
                                flattendVertices.Add(point.Y);
                                flattendVertices.Add(point.Z + 0.2);
                            }

                            subSiteSetbackVertices.Add(flattendVertices.ToArray());
                        }
                    }

                    response.subSiteSetbackVertices = response.subSiteSetbackVertices.Concat(subSiteSetbackVertices.ToArray()).ToArray();
                }

                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
                return InternalServerError(new Exception(ex.Message));
            }
        }
    }
}