using InfoLiceu.Domain.Services;
using Microsoft.AspNetCore.Mvc;

namespace InfoLiceu.Web.ViewComponents;

/// <summary>
/// ViewComponent care încarcă lista de capitole din IChapterService și o afișează în sidebar.
/// Înlocuiește vechea listă hardcodată din _Sidebar.cshtml.
/// </summary>
public class ChapterSidebarViewComponent : ViewComponent
{
    private readonly IChapterService _chapterService;

    public ChapterSidebarViewComponent(IChapterService chapterService)
    {
        _chapterService = chapterService;
    }

    public async Task<IViewComponentResult> InvokeAsync()
    {
        var chapters = await _chapterService.ListChaptersAsync();
        return View(chapters);
    }
}
