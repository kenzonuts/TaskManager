using Moq;
using TaskManager.Application.TaskItem.Command.Create;
using TaskManager.Domain.Data;
using TaskManager.Domain.Repositories;

namespace TaskManager.Application.Tests;

public class CreateTaskCommandHandlerTests
{
    [Fact]
    public async Task Handle_ValidRequest_CreatesTaskAndReturnsId()
    {
        var userId = Guid.NewGuid();
        TaskItem? saved = null;

        var taskRepo = new Mock<IRepositoryTaskItem>();
        taskRepo
            .Setup(r => r.AddAsync(It.IsAny<TaskItem>()))
            .Callback<TaskItem>(t => saved = t)
            .Returns(Task.CompletedTask);

        var categoryRepo = new Mock<ICategoryRepository>();

        var handler = new CreateTaskCommandHandler(
            taskRepo.Object,
            categoryRepo.Object,
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
        taskRepo.Verify(r => r.AddAsync(It.IsAny<TaskItem>()), Times.Once);
    }

    [Fact]
    public async Task Handle_CategoryOwnedByOtherUser_Throws()
    {
        var userId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();

        var taskRepo = new Mock<IRepositoryTaskItem>();
        var categoryRepo = new Mock<ICategoryRepository>();
        categoryRepo.Setup(r => r.GetByIdAsync(categoryId)).ReturnsAsync(new Category
        {
            CategoryId = categoryId,
            Name = "Other",
            UserId = otherUserId
        });

        var handler = new CreateTaskCommandHandler(
            taskRepo.Object,
            categoryRepo.Object,
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

        taskRepo.Verify(r => r.AddAsync(It.IsAny<TaskItem>()), Times.Never);
    }
}
