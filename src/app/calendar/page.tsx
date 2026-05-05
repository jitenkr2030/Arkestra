'use client'

import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatDate, formatTime } from '@/lib/utils'
import { Music, Calendar as CalendarIcon } from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  startTime: string
  endTime: string
  eventType: string
  location: string
  status: string
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events')
      const data = await res.json()
      setEvents(data)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'CONCERT':
        return 'bg-indigo-500'
      case 'REHEARSAL':
        return 'bg-emerald-500'
      case 'PERFORMANCE':
        return 'bg-amber-500'
      default:
        return 'bg-slate-500'
    }
  }

  const upcomingEvents = events
    .filter(e => new Date(e.startTime) >= new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  const groupedEvents = upcomingEvents.reduce((acc, event) => {
    const date = formatDate(event.startTime)
    if (!acc[date]) acc[date] = []
    acc[date].push(event)
    return acc
  }, {} as Record<string, CalendarEvent[]>)

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
          <p className="text-slate-500 mt-1">View and manage your orchestra events</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Event List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary-500" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(groupedEvents).length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No upcoming events</p>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedEvents).map(([date, dateEvents]) => (
                      <div key={date}>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">{date}</h3>
                        <div className="space-y-3">
                          {dateEvents.map((event) => (
                            <div
                              key={event.id}
                              className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                              <div className={`w-1 h-full min-h-[60px] rounded-full ${getEventColor(event.eventType)}`} />
                              <div className="flex-1">
                                <p className="font-medium text-slate-900">{event.title}</p>
                                <p className="text-sm text-slate-500 mt-1">
                                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded">
                                    {event.eventType}
                                  </span>
                                  {event.location && (
                                    <span className="text-xs text-slate-400">{event.location}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                      <span className="text-sm text-slate-600">Concerts</span>
                    </div>
                    <span className="text-sm font-medium">{events.filter(e => e.eventType === 'CONCERT').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="text-sm text-slate-600">Rehearsals</span>
                    </div>
                    <span className="text-sm font-medium">{events.filter(e => e.eventType === 'REHEARSAL').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span className="text-sm text-slate-600">Performances</span>
                    </div>
                    <span className="text-sm font-medium">{events.filter(e => e.eventType === 'PERFORMANCE').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-500"></div>
                      <span className="text-sm text-slate-600">Other</span>
                    </div>
                    <span className="text-sm font-medium">{events.filter(e => e.eventType === 'OTHER').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 mb-3">
                    <Music className="w-6 h-6 text-primary-500" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{events.length}</p>
                  <p className="text-sm text-slate-500">Total Events</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}