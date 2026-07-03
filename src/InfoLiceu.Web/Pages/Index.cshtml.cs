using InfoLiceu.Domain.Services;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace InfoLiceu.Web.Pages;

public class IndexModel : PageModel
{
    private readonly IChapterService _chapterService;

    public List<Domain.DTOs.ChapterCardDto> Chapters { get; set; } = [];

    public IndexModel(IChapterService chapterService)
    {
        _chapterService = chapterService;
    }

    public async Task OnGet()
    {
        Chapters = await _chapterService.ListChaptersAsync();
    }
}
