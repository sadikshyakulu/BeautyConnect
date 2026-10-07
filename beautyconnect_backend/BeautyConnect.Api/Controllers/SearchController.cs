using BeautyConnect.Core.DTOs;
using BeautyConnect.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BeautyConnect.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class SearchController : ControllerBase
{
    private readonly ISearchService _searchService;

    public SearchController(ISearchService searchService)
    {
        _searchService = searchService;
    }

    [HttpGet("professionals")]
    public async Task<IActionResult> SearchProfessionals([FromQuery] ProfessionalSearchQueryDto query)
    {
        if (query.MinPrice.HasValue
            && query.MaxPrice.HasValue
            && query.MinPrice.Value > query.MaxPrice.Value)
        {
            return BadRequest(new { message = "Minimum price cannot be greater than maximum price." });
        }

        if (query.Latitude.HasValue != query.Longitude.HasValue)
        {
            return BadRequest(new { message = "Latitude and longitude must be provided together." });
        }

        var results = await _searchService.SearchProfessionalsAsync(query);
        return Ok(results);
    }
}
