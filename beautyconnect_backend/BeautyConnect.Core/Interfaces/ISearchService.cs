using BeautyConnect.Core.DTOs;

namespace BeautyConnect.Core.Interfaces;

public interface ISearchService
{
    Task<ProfessionalSearchResponseDto> SearchProfessionalsAsync(ProfessionalSearchQueryDto query);
}
