using InfoLiceu.Domain.Stores;
using InfoLiceu.Application.Services;
using NSubstitute;
using Shouldly;

namespace InfoLiceu.Infrastructure.Tests.Services;

public partial class ExerciseServiceTests
{
    private readonly IExerciseStore _exerciseStore = Substitute.For<IExerciseStore>();
}

public partial class ExerciseServiceTests
{
    [Theory]
    [InlineData(1)] // store is null
    public void Constructor_Should_ThrowArgumentNullException_When_ParameterIsNull(int nullParamIndex)
    {
        var store = nullParamIndex == 1 ? null! : _exerciseStore;

        Should.Throw<ArgumentNullException>(() => new ExerciseService(store));
    }
}

public partial class ExerciseServiceTests
{
    [Fact]
    public async Task GetByChapterAsync_Should_ThrowNotImplemented_When_Called()
    {
        var sut = new ExerciseService(_exerciseStore);

        await Should.ThrowAsync<NotImplementedException>(
            () => sut.GetByChapterAsync(1));
    }
}
