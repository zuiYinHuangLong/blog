import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

export function formatDate(
  date: string | null | undefined,
  format = 'YYYY-MM-DD HH:mm'
) {
  if (!date) return '-'
  return dayjs(date).format(format)
}

export function fromNow(date: string | null | undefined) {
  if (!date) return '-'
  return dayjs(date).fromNow()
}
