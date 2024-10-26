const dummyData = {
    levels: ['Easy', 'Medium', 'Hard', 'Expert'],
    topics: ['Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming'],
    questions: [
        {
            id: 1,
            title: 'Two Sum',
            description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
            difficulty: 'Easy',
            topic: 'Arrays',
            solutionType: 'JavaScript Solution',
            solutionCode: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
            options: [
                { key: 'A', value: 'O(n)' },
                { key: 'B', value: 'O(n^2)' },
                { key: 'C', value: 'O(log n)' },
                { key: 'D', value: 'O(1)' }
            ],
            correctAnswer: 'A'
        },
        {
            id: 2,
            title: 'Reverse Linked List',
            description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
            difficulty: 'Medium',
            topic: 'Linked Lists',
            solutionType: 'Python Solution',
            solutionCode: `def reverseList(self, head):
    prev = None
    current = head
    while current:
        next_temp = current.next
        current.next = prev
        prev = current
        current = next_temp
    return prev`,
            options: [
                { key: 'A', value: 'Iterative approach' },
                { key: 'B', value: 'Recursive approach' },
                { key: 'C', value: 'Using a stack' },
                { key: 'D', value: 'Using an array' }
            ],
            correctAnswer: 'A'
        },
        // Add more questions as needed
    ]
};

export default dummyData;
