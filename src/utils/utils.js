export function getAuthorAvatar(author) {
    if (author.links && author.links.avatar) {
      return author.links.avatar.href;
    }
    return null;
  }