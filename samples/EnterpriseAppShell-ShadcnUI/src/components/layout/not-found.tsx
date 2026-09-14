import { useLocation, useNavigate } from "react-router"
import { MapPinOffIcon } from "lucide-react"

import { EmptyState } from "@/components/common/empty-state"

export function NotFound() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <div className="@container/main flex flex-1 flex-col justify-center gap-4 p-4 md:gap-6 md:p-6">
      <EmptyState
        icon={MapPinOffIcon}
        title="Page not found"
        description={`Nothing is routed to ${pathname}. It may have been renamed, or the app that owned it was removed.`}
        action={{ label: "Back to the dashboard", onClick: () => navigate("/") }}
      />
    </div>
  )
}
