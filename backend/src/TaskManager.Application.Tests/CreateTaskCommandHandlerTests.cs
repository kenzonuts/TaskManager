using Moq;
using TaskManager.Application.TaskItem.Command.Create;
using TaskManager.Domain.Repositories;
using DomainCategory = TaskManager.Domain.Data.Category;
using DomainTask = TaskManager.Domain.Data.TaskItem;

namespace TaskManager.Application.Tests;

public class CreateTaskCommandHandlerTests
{
    [Fact]
    public async Task Handle_ValidRequest_CreatesTaskAndReturnsId()
    {
        var userId = Guid.NewGuid();
        DomainTask? saved = null;

        var taskRepo = new Mock<IRepositoryTaskItem>();
        taskRepo
            .Setup(r => r.AddAsync(It.IsAny<DomainTask>()))
            .Callback<DomainTask>(t => saved = t)
            .Returns(Task.CompletedTask);

        var categoryRepo = new Mock<ICategoryRepository>();
        var projectRepo = new Mock<IProjectRepository>();

        var handler = new CreateTaskCommandHandler(
            taskRepo.Object,
            categoryRepo.Object,
            projectRepo.Object,
            TestHttp.ForUser(userId));

        var id = await handler.Handle(
            new CreateTaskCommand
            {
                Title = "Write tests",
                Description = "Phase 5",
                Priority = 1,
                CategoryId = null
            },
            CancellationToken.None);

        Assert.NotEqual(Guid.Empty, id);
        Assert.NotNull(saved);
        Assert.Equal(id, saved!.TaskId);
        Assert.Equal("Write tests", saved.Title);
        Assert.Equal(userId, saved.UserId);
        Assert.False(saved.IsCompleted);
        Assert.Null(saved.CompletedAt);
        Assert.True(saved.UpdatedAt >= saved.CreatedAt);
        taskRepo.Verify(r => r.AddAsync(It.IsAny<DomainTask>()), Times.Once);
    }

    [Fact]
    public async Task Handle_CategoryOwnedByOtherUser_Throws()
    {
        var userId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();

        var taskRepo = new Mock<IRepositoryTaskItem>();
        var categoryRepo = new Mock<ICategoryRepository>();
        var projectRepo = new Mock<IProjectRepository>();
        categoryRepo.Setup(r => r.GetByIdAsync(categoryId)).ReturnsAsync(new DomainCategory
        {
            CategoryId = categoryId,
            Name = "Other",
            UserId = otherUserId
        });

        var handler = new CreateTaskCommandHandler(
            taskRepo.Object,
            categoryRepo.Object,
            projectRepo.Object,
            TestHttp.ForUser(userId));

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            handler.Handle(
                new CreateTaskCommand
                {
                    Title = "Nope",
                    Priority = 0,
                    CategoryId = categoryId
                },
                CancellationToken.None));

        taskRepo.Verify(r => r.AddAsync(It.IsAny<DomainTask>()), Times.Never);
    }
}
