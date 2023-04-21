using Duende.Bff.Yarp;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
 
var builder = WebApplication.CreateBuilder(args);
 
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
 
builder.Services
    // Configure ASP.NET Authentication
    .AddAuthentication(options =>
    {
        options.DefaultScheme = "Cookies";
        options.DefaultChallengeScheme = "oidc";
        options.DefaultSignOutScheme = "oidc";
    })
    // Configure ASP.NET Cookie Authentication
    .AddCookie("Cookies", options =>
    {
        options.ExpireTimeSpan = TimeSpan.FromHours(8);
        options.SlidingExpiration = false;
        options.Cookie.Name = "__MyWeatherAuth";
        // When the value is Strict the cookie will only be sent along with "same-site" requests.
        options.Cookie.SameSite = SameSiteMode.Strict;
    })
    // Configure OpenID Connect
    .AddOpenIdConnect("oidc", options =>
    {
        options.Authority = $"https://{builder.Configuration["Auth0:Authority"]}";
        options.ClientId = builder.Configuration["Auth0:ClientId"];
        options.ClientSecret = builder.Configuration["Auth0:ClientSecret"];
 
        options.ResponseType = OpenIdConnectResponseType.Code;
        options.ResponseMode = OpenIdConnectResponseMode.Query;
 
        // Go to the user info endpoint to retrieve additional claims after creating an identity from the id_token
        options.GetClaimsFromUserInfoEndpoint = true;
        // Store access and refresh tokens in the authentication cookie
        options.SaveTokens = true;
 
        options.Scope.Clear();
        options.Scope.Add("openid");
        options.Scope.Add("profile");
        options.Scope.Add("offline_access");

        options.Events.OnRedirectToIdentityProviderForSignOut = ctx =>
        {
            ctx.ProtocolMessage.IssuerAddress = $"https://{builder.Configuration["Auth0:Authority"]}/v2/logout?returnTo=https://localhost:7293/&client_id={builder.Configuration["Auth0:ClientId"]}";
            return Task.CompletedTask;
        };
    });
 
// Register BFF services and configure the BFF middleware
builder.Services.AddBff().AddRemoteApis().AddServerSideSessions();
builder.Services.AddAuthorization();
 
var app = builder.Build();
 
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
 
app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();
 
app.UseAuthentication();
// Use the BFF middleware (must be before UseAuthorization)
app.UseBff();
app.UseAuthorization();
 
// Adds the BFF management endpoints (/bff/login, /bff/logout, ...)
app.MapBffManagementEndpoints();
app.MapRemoteBffApiEndpoint("/api", app.Configuration["RemoteApiEndpoint"]!).RequireAccessToken();
 
// var summaries = new[]
// {
//     "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
// };
//  
// app.MapGet("/api/weatherforecast", () =>
// {
//     var forecast = Enumerable.Range(1, 5).Select(index =>
//         new WeatherForecast
//         (
//             DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
//             Random.Shared.Next(-20, 55),
//             summaries[Random.Shared.Next(summaries.Length)]
//         ))
//         .ToArray();
//     return forecast;
// })
// .WithName("GetWeatherForecast")
// .AsBffApiEndpoint()
// .RequireAuthorization()
// .WithOpenApi();
 
app.Run();
 
// record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
// {
//     public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
// }