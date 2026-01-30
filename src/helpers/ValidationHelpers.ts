export function isNullOrWhitespace(input: any) {
  if (typeof input === 'undefined' || input == null) return true;

  return input.toString().replace(/\s/g, '').length < 1;
}

export type StoryMediaType = 'image' | 'video';

export function getStoryMediaType(item: {
  story_video?: string;
}): StoryMediaType {
  if (
    typeof item.story_video !== 'undefined' &&
    item.story_video != null &&
    !isNullOrWhitespace(item.story_video)
  ) {
    return 'video';
  }
  return 'image';
}
