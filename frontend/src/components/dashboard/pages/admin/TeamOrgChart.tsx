import { TeamMember } from '../../../../types/businessPlan'
import { Users, Mail, Linkedin } from 'lucide-react'

interface TeamOrgChartProps {
  members: TeamMember[]
  type?: 'hierarchical' | 'flat'
}

export default function TeamOrgChart({ members, type = 'hierarchical' }: TeamOrgChartProps) {
  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <p>Nessun membro del team da visualizzare</p>
      </div>
    )
  }

  // Group members by department for hierarchical view
  const membersByDepartment = members.reduce((acc, member) => {
    const dept = member.department || 'Non assegnato'
    if (!acc[dept]) acc[dept] = []
    acc[dept].push(member)
    return acc
  }, {} as Record<string, TeamMember[]>)

  const renderMemberCard = (member: TeamMember, size: 'small' | 'medium' | 'large' = 'medium') => {
    const sizes = {
      small: 'p-3',
      medium: 'p-4',
      large: 'p-6'
    }

    const photoSizes = {
      small: 'w-12 h-12',
      medium: 'w-16 h-16',
      large: 'w-20 h-20'
    }

    return (
      <div
        key={member.id}
        className={`bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all ${sizes[size]}`}
      >
        <div className="flex items-start space-x-3">
          {member.photoUrl ? (
            <img
              src={member.photoUrl}
              alt={member.name}
              className={`${photoSizes[size]} rounded-full object-cover flex-shrink-0`}
            />
          ) : (
            <div className={`${photoSizes[size]} rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0`}>
              <span className="text-white font-bold text-xl">
                {member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 truncate">{member.name}</h4>
            <p className="text-sm text-blue-600 font-medium truncate">{member.role}</p>
            {member.department && (
              <p className="text-xs text-gray-500 mt-1">{member.department}</p>
            )}

            {size !== 'small' && member.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {member.description}
              </p>
            )}

            {size === 'large' && (
              <div className="flex items-center space-x-3 mt-3">
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="text-xs text-gray-600 hover:text-blue-600 flex items-center space-x-1"
                    title={member.email}
                  >
                    <Mail className="h-3 w-3" />
                    <span className="truncate max-w-[150px]">{member.email}</span>
                  </a>
                )}
                {member.linkedIn && (
                  <a
                    href={member.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <Linkedin className="h-3 w-3" />
                    <span>LinkedIn</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (type === 'flat') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map(member => renderMemberCard(member, 'medium'))}
      </div>
    )
  }

  // Hierarchical view
  return (
    <div className="space-y-6">
      {Object.entries(membersByDepartment).map(([department, deptMembers]) => (
        <div key={department} className="space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b-2 border-gray-200">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-gray-900 text-lg">{department}</h3>
            <span className="text-sm text-gray-500">({deptMembers.length})</span>
          </div>

          {/* Show first member (leader) larger if it exists */}
          {deptMembers.length > 0 && (
            <div className="mb-4">
              {renderMemberCard(deptMembers[0], 'large')}
            </div>
          )}

          {/* Show remaining members in a grid */}
          {deptMembers.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-6 border-l-4 border-blue-200 pl-4">
              {deptMembers.slice(1).map(member => renderMemberCard(member, 'medium'))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
