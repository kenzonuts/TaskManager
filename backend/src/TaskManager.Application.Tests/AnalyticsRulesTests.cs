using TaskManager.Domain.Enum;
using DomainTask = TaskManager.Domain.Data.TaskItem;

namespace TaskManager.Application.Tests;

/// <summary>
/// Mirrors frontend weekly/streak completion-day rules for regression safety.
/// </summary>
public class AnalyticsRulesTests
{
    private static DomainTask Done(DateTime completedAt) => new()
    {
        TaskId = Guid.NewGuid(),
        Title = "t",
        IsCompleted = true,
        CompletedAt = completedAt,
        UpdatedAt = completedAt,
        CreatedAt = completedAt.AddDays(-1),
        Priority = PriorityLevel.Medium,
        UserId = Guid.NewGuid()
    };

    private static DateTime StartOfWeekMonday(DateTime refDate)
    {
        var d = refDate.Date;
        var diff = d.DayOfWeek == DayOfWeek.Sunday ? -6 : DayOfWeek.Monday - d.DayOfWeek;
        return d.AddDays((int)diff);
    }

    [Fact]
    public void WeeklyCompleted_CountsOnlyCurrentWeek()
    {
        var monday = StartOfWeekMonday(DateTime.UtcNow);
        var tasks = new[]
        {
            Done(monday.AddHours(10)),
            Done(monday.AddDays(2)),
            Done(monday.AddHours(-1)),
        };

        var end = monday.AddDays(7);
        var count = tasks.Count(t =>
            t.IsCompleted &&
            t.CompletedAt.HasValue &&
            t.CompletedAt.Value >= monday &&
            t.CompletedAt.Value < end);

        Assert.Equal(2, count);
    }

    [Fact]
    public void Streak_CountsConsecutiveDaysEndingTodayOrYesterday()
    {
        var today = DateTime.UtcNow.Date;
        var tasks = new[]
        {
            Done(today.AddHours(9)),
            Done(today.AddDays(-1).AddHours(12)),
            Done(today.AddDays(-2).AddHours(8)),
            Done(today.AddDays(-4)),
        };

        var days = tasks
            .Where(t => t.IsCompleted && t.CompletedAt.HasValue)
            .Select(t => t.CompletedAt!.Value.Date)
            .ToHashSet();

        var cursor = today;
        if (!days.Contains(cursor))
        {
            cursor = cursor.AddDays(-1);
            Assert.Contains(cursor, days);
        }

        var streak = 0;
        while (days.Contains(cursor))
        {
            streak++;
            cursor = cursor.AddDays(-1);
        }

        Assert.Equal(3, streak);
    }
}
