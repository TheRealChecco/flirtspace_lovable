import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/chat/$characterId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/chat/$characterId"!</div>
}
