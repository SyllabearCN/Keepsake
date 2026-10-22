export function parseAlbumFolderName(folderName: string) {
  const match = folderName.match(/^(.+?)\s+(\d{4})-(\d{1,2})-(\d{1,2})$/u)
  if (!match)
    return null

  const year = match[2]!
  const month = match[3]!.padStart(2, '0')
  const day = match[4]!.padStart(2, '0')
  const date = `${year}-${month}-${day}`
  const parsedDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))

  if (
    parsedDate.getUTCFullYear() !== Number(year)
    || parsedDate.getUTCMonth() + 1 !== Number(month)
    || parsedDate.getUTCDate() !== Number(day)
  ) {
    return null
  }

  return {
    title: match[1]!.trim(),
    date,
  }
}
