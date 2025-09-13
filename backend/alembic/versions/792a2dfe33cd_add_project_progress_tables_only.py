"""add_project_progress_tables_only

Revision ID: 792a2dfe33cd
Revises: ef822b2a8365
Create Date: 2025-09-13 09:36:53.602353

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '792a2dfe33cd'
down_revision: Union[str, None] = 'ef822b2a8365'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create project_progress table
    op.create_table('project_progress',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False),
        sa.Column('updated_by', sa.Integer(), nullable=False),
        sa.Column('is_published', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
        sa.ForeignKeyConstraint(['updated_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('project_id')
    )
    op.create_index(op.f('ix_project_progress_id'), 'project_progress', ['id'], unique=False)
    
    # Create progress_history table
    op.create_table('progress_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('progress_id', sa.Integer(), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('change_summary', sa.String(length=500), nullable=True),
        sa.Column('updated_by', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['progress_id'], ['project_progress.id'], ),
        sa.ForeignKeyConstraint(['updated_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_progress_history_id'), 'progress_history', ['id'], unique=False)
    
    # Add performance indexes for project_progress
    op.create_index('ix_project_progress_project_id', 'project_progress', ['project_id'])
    op.create_index('ix_project_progress_updated_by', 'project_progress', ['updated_by'])
    op.create_index('ix_project_progress_is_published', 'project_progress', ['is_published'])
    op.create_index('ix_project_progress_updated_at', 'project_progress', ['updated_at'])
    
    # Add performance indexes for progress_history
    op.create_index('ix_progress_history_progress_id', 'progress_history', ['progress_id'])
    op.create_index('ix_progress_history_version', 'progress_history', ['version'])
    op.create_index('ix_progress_history_updated_by', 'progress_history', ['updated_by'])
    op.create_index('ix_progress_history_created_at', 'progress_history', ['created_at'])
    op.create_index('ix_progress_history_progress_version', 'progress_history', ['progress_id', 'version'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_progress_history_progress_version', table_name='progress_history')
    op.drop_index('ix_progress_history_created_at', table_name='progress_history')
    op.drop_index('ix_progress_history_updated_by', table_name='progress_history')
    op.drop_index('ix_progress_history_version', table_name='progress_history')
    op.drop_index('ix_progress_history_progress_id', table_name='progress_history')
    
    op.drop_index('ix_project_progress_updated_at', table_name='project_progress')
    op.drop_index('ix_project_progress_is_published', table_name='project_progress')
    op.drop_index('ix_project_progress_updated_by', table_name='project_progress')
    op.drop_index('ix_project_progress_project_id', table_name='project_progress')
    
    # Drop tables
    op.drop_index(op.f('ix_progress_history_id'), table_name='progress_history')
    op.drop_table('progress_history')
    op.drop_index(op.f('ix_project_progress_id'), table_name='project_progress')
    op.drop_table('project_progress')
