function formatUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    tasks: user.tasks.map(task => ({
      id: task._id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      createdAt: task.createdAt
    })),
    createdAt: user.createdAt
  };
}

module.exports = { formatUser };