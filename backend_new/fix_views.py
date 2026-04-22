import re

with open('users/views.py', 'r', encoding='utf-8') as f:
    content = f.read()

# The clean replacement starting from get_employee_attendance_logs onward
clean_tail = """

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdmin])
def get_employee_attendance_logs(request, pk):
    \"\"\"Admin view for employee attendance history.\"\"\"
    try:
        user = User.objects.get(id=pk)
    except Exception:
        return Response({'error': 'User not found'}, status=404)

    logs = AttendanceRecord.objects(user=user).order_by('-start_time')
    return Response([{
        'id': str(l.id),
        'start_time': l.start_time.isoformat() + 'Z',
        'end_time': (l.end_time.isoformat() + 'Z') if l.end_time else None,
        'status': l.status,
        'duration': str(l.end_time - l.start_time).split('.')[0] if l.end_time else 'Active'
    } for l in logs])


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdmin])
def activity_heatmap(request):
    \"\"\"
    Returns an array of 24 values (one per hour, 0-23) representing
    how many login sessions started in that hour across all employees.
    Values are normalised into levels 0-3 for the heatmap display.
    \"\"\"
    counts = [0] * 24
    for record in AttendanceRecord.objects():
        hour = record.start_time.hour
        counts[hour] += 1

    max_count = max(counts) if max(counts) > 0 else 1

    def to_level(c):
        if c == 0:
            return 0
        ratio = c / max_count
        if ratio < 0.33:
            return 1
        if ratio < 0.66:
            return 2
        return 3

    return Response({'hourly': [to_level(c) for c in counts], 'raw': counts})
"""

# Find the anchor: the end of get_current_attendance (return Response(None))
# We'll cut everything after it and replace with the clean tail
anchor = 'return Response(None)'
idx = content.rfind(anchor)
if idx == -1:
    print('ERROR: anchor not found')
    exit(1)

# Keep everything up to and including "return Response(None)\n"
cut_pos = idx + len(anchor)
# skip past any trailing whitespace/newlines on that line
while cut_pos < len(content) and content[cut_pos] in ('\r', '\n'):
    cut_pos += 1

new_content = content[:idx + len(anchor)] + '\n' + clean_tail

with open('users/views.py', 'w', encoding='utf-8', newline='\n') as f:
    f.write(new_content)

print(f'Done. Total lines: {new_content.count(chr(10))}')
