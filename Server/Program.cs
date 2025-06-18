using Microsoft.Owin.Hosting;
using System;
using System.Diagnostics;
using System.Management;

namespace WebServer
{
    class Program
    {
        static void Main(string[] args)
        {
            string baseAddress = "http://localhost:5181/";
            
            Process npmProcess = null;//RunNpmDev("../../../Client");
            Process browserProcess = null;

            if (npmProcess == null)
            {
                browserProcess = OpenBrowser(baseAddress);
            }
            else {
                browserProcess = OpenBrowser("http://localhost:5173/");
            }

            using (WebApp.Start<Startup>(url: baseAddress))
            {
                Console.WriteLine($"Self-hosting API at {baseAddress}");
                Console.WriteLine("Press Enter to quit...");
                Console.ReadLine();
            }

            if (npmProcess != null && npmProcess.HasExited == false)
            {
                TerminateProcessRecursive(npmProcess.Id);
            }
        }

        private static Process OpenBrowser(string url)
        {
            try
            {
                return Process.Start(new ProcessStartInfo
                {
                    FileName = url,
                    UseShellExecute = true
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to open browser: {ex.Message}");
                return null;
            }
        }

        private static Process RunNpmDev(string projectPath)
        {
            try
            {
                var startInfo = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = $"/K cd {projectPath} && npm run dev",
                    UseShellExecute = true,
                    CreateNoWindow = false,
                    WindowStyle = ProcessWindowStyle.Normal
                };

                var process = new Process
                {
                    StartInfo = startInfo
                };

                process.Start();
                return process;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to run npm: {ex.Message}");
                return null;
            }
        }

        private static void TerminateProcessRecursive(int parentId)
        {
            string query = $"Select * From Win32_Process Where ParentProcessID={parentId}";
            using (var searcher = new ManagementObjectSearcher(query))
            using (var results = searcher.Get())
            {
                foreach (ManagementObject mo in results)
                {
                    TerminateProcessRecursive(Convert.ToInt32(mo["ProcessID"]));
                }
            }

            try
            {
                Process process = Process.GetProcessById(parentId);

                if (process != null && process.HasExited == false)
                {
                    process.Kill();
                    process.WaitForExit();
                }
            }
            catch (ArgumentException)
            {
            }
        }
    }
}
