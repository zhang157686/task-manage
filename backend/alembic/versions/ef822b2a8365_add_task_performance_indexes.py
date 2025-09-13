"""add_task_performance_indexes

Revision ID: ef822b2a8365
Revises: ce685bb16919
Create Date: 2025-09-13 09:02:22.171915

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ef822b2a8365'
down_revision: Union[str, None] = 'ce685bb16919'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add indexes for better query performance
    
    # Tasks table indexes
    op.create_index('ix_tasks_project_id', 'tasks', ['project_id'])
    op.create_index('ix_tasks_parent_id', 'tasks', ['parent_id'])
    op.create_index('ix_tasks_status', 'tasks', ['status'])
    op.create_index('ix_tasks_priority', 'tasks', ['priority'])
    op.create_index('ix_tasks_assignee_id', 'tasks', ['assignee_id'])
    op.create_index('ix_tasks_due_date', 'tasks', ['due_date'])
    op.create_index('ix_tasks_created_at', 'tasks', ['created_at'])
    op.create_index('ix_tasks_updated_at', 'tasks', ['updated_at'])
    op.create_index('ix_tasks_order_index', 'tasks', ['order_index'])
    
    # Composite indexes for common queries
    op.create_index('ix_tasks_project_status', 'tasks', ['project_id', 'status'])
    op.create_index('ix_tasks_project_parent', 'tasks', ['project_id', 'parent_id'])
    op.create_index('ix_tasks_status_priority', 'tasks', ['status', 'priority'])
    
    # Task dependencies indexes
    op.create_index('ix_task_dependencies_task_id', 'task_dependencies', ['task_id'])
    op.create_index('ix_task_dependencies_depends_on_id', 'task_dependencies', ['depends_on_id'])
    
    # Task logs indexes
    op.create_index('ix_task_logs_task_id', 'task_logs', ['task_id'])
    op.create_index('ix_task_logs_user_id', 'task_logs', ['user_id'])
    op.create_index('ix_task_logs_action', 'task_logs', ['action'])
    op.create_index('ix_task_logs_created_at', 'task_logs', ['created_at'])
    op.create_index('ix_task_logs_task_created', 'task_logs', ['task_id', 'created_at'])


def downgrade() -> None:
    # Remove indexes
    
    # Task logs indexes
    op.drop_index('ix_task_logs_task_created', 'task_logs')
    op.drop_index('ix_task_logs_created_at', 'task_logs')
    op.drop_index('ix_task_logs_action', 'task_logs')
    op.drop_index('ix_task_logs_user_id', 'task_logs')
    op.drop_index('ix_task_logs_task_id', 'task_logs')
    
    # Task dependencies indexes
    op.drop_index('ix_task_dependencies_depends_on_id', 'task_dependencies')
    op.drop_index('ix_task_dependencies_task_id', 'task_dependencies')
    
    # Composite indexes
    op.drop_index('ix_tasks_status_priority', 'tasks')
    op.drop_index('ix_tasks_project_parent', 'tasks')
    op.drop_index('ix_tasks_project_status', 'tasks')
    
    # Tasks table indexes
    op.drop_index('ix_tasks_order_index', 'tasks')
    op.drop_index('ix_tasks_updated_at', 'tasks')
    op.drop_index('ix_tasks_created_at', 'tasks')
    op.drop_index('ix_tasks_due_date', 'tasks')
    op.drop_index('ix_tasks_assignee_id', 'tasks')
    op.drop_index('ix_tasks_priority', 'tasks')
    op.drop_index('ix_tasks_status', 'tasks')
    op.drop_index('ix_tasks_parent_id', 'tasks')
    op.drop_index('ix_tasks_project_id', 'tasks')
