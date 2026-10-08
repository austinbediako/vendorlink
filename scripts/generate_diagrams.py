import matplotlib.pyplot as plt
import matplotlib.patches as patches
import os

os.makedirs('docs/diagrams', exist_ok=True)

def draw_box(ax, x, y, w, h, text, color='#2B6CB0'):
    rect = patches.Rectangle((x, y), w, h, linewidth=2, edgecolor=color, facecolor='#F7FAFC')
    ax.add_patch(rect)
    ax.text(x + w/2, y + h/2, text, horizontalalignment='center', verticalalignment='center', 
            fontsize=12, fontweight='bold', color='#1A365D')

def draw_arrow(ax, x1, y1, x2, y2):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(facecolor='#319795', edgecolor='#319795', width=2, headwidth=10))

# 1. Architecture Diagram
fig, ax = plt.subplots(figsize=(10, 8), dpi=300)
ax.set_xlim(0, 10)
ax.set_ylim(0, 10)
ax.axis('off')

draw_box(ax, 1, 7, 8, 2, "Presentation Tier (Next.js / React)\nClient & Admin Dashboards")
draw_box(ax, 1, 4, 8, 2, "Application Tier (Node.js / Express)\nREST API & Business Logic")
draw_box(ax, 1, 1, 8, 2, "Data Tier (PostgreSQL)\nRelational Database")

draw_arrow(ax, 5, 7, 5, 6)
draw_arrow(ax, 5, 4, 5, 3)

plt.title("Figure 3.1: Multi-Tier Modular Monolith Architecture", fontsize=14, fontweight='bold', pad=20, color='#1A365D')
plt.tight_layout()
plt.savefig('docs/diagrams/architecture.png', dpi=300, bbox_inches='tight')
plt.close()

# 2. ERD
fig, ax = plt.subplots(figsize=(12, 10), dpi=300)
ax.set_xlim(0, 12)
ax.set_ylim(0, 10)
ax.axis('off')

draw_box(ax, 1, 7, 3, 2, "Users\n- user_id (PK)\n- email\n- role\n- password_hash", '#ED8936')
draw_box(ax, 5, 7, 3, 2, "Business_Profiles\n- profile_id (PK)\n- user_id (FK)\n- business_name", '#ED8936')
draw_box(ax, 5, 4, 3, 2, "Service_Requests\n- request_id (PK)\n- business_id (FK)\n- description", '#ED8936')
draw_box(ax, 9, 4, 3, 2, "Bookings\n- booking_id (PK)\n- request_id (FK)\n- artisan_id (FK)", '#ED8936')
draw_box(ax, 1, 4, 3, 2, "Artisan_Profiles\n- profile_id (PK)\n- user_id (FK)\n- category", '#ED8936')

draw_arrow(ax, 4, 8, 5, 8)
draw_arrow(ax, 2.5, 7, 2.5, 6)
draw_arrow(ax, 6.5, 7, 6.5, 6)
draw_arrow(ax, 8, 5, 9, 5)

plt.title("Figure 3.3: Entity-Relationship Diagram (ERD)", fontsize=14, fontweight='bold', pad=20, color='#1A365D')
plt.tight_layout()
plt.savefig('docs/diagrams/erd.png', dpi=300, bbox_inches='tight')
plt.close()

# 3. State Machine Diagram
fig, ax = plt.subplots(figsize=(12, 6), dpi=300)
ax.set_xlim(0, 12)
ax.set_ylim(0, 6)
ax.axis('off')

draw_box(ax, 0.5, 2.5, 2, 1, "Requested", '#319795')
draw_box(ax, 3.5, 2.5, 2, 1, "Applied", '#319795')
draw_box(ax, 6.5, 2.5, 2, 1, "Accepted", '#319795')
draw_box(ax, 9.5, 2.5, 2, 1, "Completed", '#319795')

draw_arrow(ax, 2.5, 3, 3.5, 3)
draw_arrow(ax, 5.5, 3, 6.5, 3)
draw_arrow(ax, 8.5, 3, 9.5, 3)

plt.title("Figure 3.2: Operational State Machine Diagram", fontsize=14, fontweight='bold', pad=20, color='#1A365D')
plt.tight_layout()
plt.savefig('docs/diagrams/state_machine.png', dpi=300, bbox_inches='tight')
plt.close()

# 4. Use Case Diagram
fig, ax = plt.subplots(figsize=(10, 8), dpi=300)
ax.set_xlim(0, 10)
ax.set_ylim(0, 10)
ax.axis('off')

ax.text(1, 8, "Business", fontsize=12, fontweight='bold')
ax.text(1, 5, "Artisan", fontsize=12, fontweight='bold')
ax.text(1, 2, "Admin", fontsize=12, fontweight='bold')

draw_box(ax, 4, 7.5, 4, 1, "Post Service Request")
draw_box(ax, 4, 6, 4, 1, "Book Artisan")
draw_box(ax, 4, 4.5, 4, 1, "Apply to Request")
draw_box(ax, 4, 3, 4, 1, "Update Status")
draw_box(ax, 4, 1.5, 4, 1, "Manage Disputes")

draw_arrow(ax, 2, 8, 4, 8)
draw_arrow(ax, 2, 8, 4, 6.5)
draw_arrow(ax, 2, 5, 4, 5)
draw_arrow(ax, 2, 5, 4, 3.5)
draw_arrow(ax, 2, 2, 4, 2)

plt.title("Figure 3.4: UML Use Case Diagram", fontsize=14, fontweight='bold', pad=20, color='#1A365D')
plt.tight_layout()
plt.savefig('docs/diagrams/use_case.png', dpi=300, bbox_inches='tight')
plt.close()

print("Diagrams generated successfully in docs/diagrams/")
