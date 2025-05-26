export const getAgentColor = (agentId: string, agents: any[]): { bg: string; border: string; text: string } => {
  if (agentId === 'moderator') {
    return {
      bg: 'bg-purple-100',
      border: 'border-purple-300',
      text: 'text-purple-800'
    };
  }

  const colors = [
    {
      bg: 'bg-blue-100',
      border: 'border-blue-300',
      text: 'text-blue-800'
    },
    {
      bg: 'bg-green-100',
      border: 'border-green-300',
      text: 'text-green-800'
    },
    {
      bg: 'bg-yellow-100',
      border: 'border-yellow-300',
      text: 'text-yellow-800'
    },
    {
      bg: 'bg-red-100',
      border: 'border-red-300',
      text: 'text-red-800'
    },
    {
      bg: 'bg-indigo-100',
      border: 'border-indigo-300',
      text: 'text-indigo-800'
    }
  ];

  const index = agents.findIndex(a => a.id === agentId);
  return colors[index % colors.length] || {
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    text: 'text-gray-800'
  };
};