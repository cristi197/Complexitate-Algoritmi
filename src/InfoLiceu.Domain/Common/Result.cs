namespace InfoLiceu.Domain.Common;

public class Result
{
    public ResultStatus Status { get; }
    public List<string> Errors { get; } = [];

    protected Result(ResultStatus status)
    {
        Status = status;
    }

    public bool IsSuccess => Status == ResultStatus.Ok;
    public bool IsError => Status == ResultStatus.Error;

    public static Result Ok() => new(ResultStatus.Ok);
    public static Result Error(string message) => new(ResultStatus.Error) { Errors = { message } };
    public static Result NotFound() => new(ResultStatus.NotFound);
}
