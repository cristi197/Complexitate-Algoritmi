using InfoLiceu.Domain.Services;
using InfoLiceu.Web.Pages.Capitole;
using NSubstitute;

namespace InfoLiceu.Web.Tests;

public class DetailModelTests
{
    [Fact]
    public void RenderBody_Should_EncodeHtml_BeforeApplyingInlineFormatting()
    {
        var model = new DetailModel(Substitute.For<IChapterService>());

        var html = model.RenderBody("Hello <script>alert(1)</script> **safe** `x < y`");

        Assert.Contains("&lt;script&gt;alert(1)&lt;/script&gt;", html);
        Assert.DoesNotContain("<script>", html);
        Assert.Contains("<strong>safe</strong>", html);
        Assert.Contains("x &lt; y", html);
    }

    [Fact]
    public void RenderBody_Should_RenderMarkdownTables_WithSeparatorRows()
    {
        var model = new DetailModel(Substitute.For<IChapterService>());

        var html = model.RenderBody("""
            | Notație | Nume |
            |---------|------|
            | O(1) | Constant |
            """);

        Assert.Contains("<table", html);
        Assert.Contains("Notație", html);
        Assert.Contains("Constant", html);
        Assert.DoesNotContain("---------", html);
    }
}
