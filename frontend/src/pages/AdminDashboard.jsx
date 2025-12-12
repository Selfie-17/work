import { useState, useEffect } from 'react';
import {
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Users,
    TrendingUp,
    AlertCircle,
    Check,
    X,
    ChevronDown,
    ChevronUp,
    GitCompare,
    Edit,
    Columns
} from 'lucide-react';
import axios from 'axios';
import DiffViewer from '../components/DiffViewer';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default function AdminDashboard() {
    const [pendingEdits, setPendingEdits] = useState([]);
    const [allEdits, setAllEdits] = useState([]);
    const [users, setUsers] = useState([]);
    const [files, setFiles] = useState([]);
    const [selectedEdit, setSelectedEdit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [expandedEdit, setExpandedEdit] = useState(null);
    const [processing, setProcessing] = useState(null);
    const [notification, setNotification] = useState(null);
    const [rejectNotes, setRejectNotes] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(null);
    const [viewMode, setViewMode] = useState({}); // { editId: 'diff' | 'editor' }

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [editsRes, usersRes, filesRes] = await Promise.all([
                axios.get('/api/edits/all'),
                axios.get('/api/users'),
                axios.get('/api/files')
            ]);
            const allEditsData = editsRes.data;
            setPendingEdits(allEditsData.filter(e => e.status === 'pending'));
            setAllEdits(allEditsData);
            setUsers(usersRes.data);
            setFiles(filesRes.data);
        } catch (error) {
            // Demo data
            const demoEdits = [
                {
                    _id: 'e1',
                    file: {
                        _id: '1',
                        name: 'README.md',
                        content: '# Welcome to MD Collab\n\nThis is a **collaborative markdown editing platform**.\n\n## Features\n\n- Role-based access control\n- Real-time markdown preview\n- GitHub-style diff viewer\n- Approval workflow'
                    },
                    editor: { name: 'John Editor', email: 'john@example.com' },
                    originalContent: '# Welcome to MD Collab\n\nThis is a **collaborative markdown editing platform**.\n\n## Features\n\n- Role-based access control\n- Real-time markdown preview\n- GitHub-style diff viewer\n- Approval workflow',
                    newContent: '# Welcome to MD Collab Platform\n\nThis is a **powerful collaborative markdown editing platform** for teams.\n\n## Features\n\n- Role-based access control (Admin, Editor, Viewer)\n- Real-time markdown preview\n- GitHub-style diff viewer\n- Approval workflow\n- File versioning\n\n## New Section\n\nThis is a newly added section!',
                    status: 'pending',
                    createdAt: new Date().toISOString()
                },
                {
                    _id: 'e2',
                    file: { _id: '2', name: 'CONTRIBUTING.md', content: '# Contributing\n\nWelcome!' },
                    editor: { name: 'Jane Editor', email: 'jane@example.com' },
                    originalContent: '# Contributing\n\nWelcome!',
                    newContent: '# Contributing Guide\n\nWelcome to our project!\n\n## How to Contribute\n\n1. Fork the repo\n2. Create a branch\n3. Submit a PR',
                    status: 'pending',
                    createdAt: new Date(Date.now() - 86400000).toISOString()
                },
                {
                    _id: 'e3',
                    file: { _id: '1', name: 'README.md', content: '' },
                    editor: { name: 'John Editor', email: 'john@example.com' },
                    originalContent: '# Old Title',
                    newContent: '# New Title',
                    status: 'approved',
                    reviewedAt: new Date(Date.now() - 172800000).toISOString(),
                    createdAt: new Date(Date.now() - 259200000).toISOString()
                }
            ];

            setPendingEdits(demoEdits.filter(e => e.status === 'pending'));
            setAllEdits(demoEdits);
            setUsers([
                { _id: 'u1', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
                { _id: 'u2', name: 'John Editor', email: 'john@example.com', role: 'editor' },
                { _id: 'u3', name: 'Jane Editor', email: 'jane@example.com', role: 'editor' },
                { _id: 'u4', name: 'Bob Viewer', email: 'bob@example.com', role: 'viewer' }
            ]);
            setFiles([
                { _id: '1', name: 'README.md', status: 'approved' },
                { _id: '2', name: 'CONTRIBUTING.md', status: 'approved' },
                { _id: '3', name: 'API.md', status: 'approved' }
            ]);
        }
        setLoading(false);
    };

    const handleApprove = async (editId) => {
        setProcessing(editId);
        try {
            await axios.post(`/api/edits/${editId}/approve`);
            setNotification({ type: 'success', message: 'Edit approved and applied to file!' });
            fetchData();
        } catch (error) {
            // Demo mode
            setPendingEdits(prev => prev.filter(e => e._id !== editId));
            setAllEdits(prev => prev.map(e => e._id === editId ? { ...e, status: 'approved', reviewedAt: new Date().toISOString() } : e));
            setNotification({ type: 'success', message: 'Edit approved! (Demo mode)' });
        }
        setSelectedEdit(null);
        setProcessing(null);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleReject = async (editId, notes = '') => {
        setProcessing(editId);
        try {
            await axios.post(`/api/edits/${editId}/reject`, { notes });
            setNotification({ type: 'info', message: 'Edit rejected.' });
            fetchData();
        } catch (error) {
            // Demo mode
            setPendingEdits(prev => prev.filter(e => e._id !== editId));
            setAllEdits(prev => prev.map(e => e._id === editId ? { ...e, status: 'rejected', reviewedAt: new Date().toISOString(), reviewNotes: notes } : e));
            setNotification({ type: 'info', message: 'Edit rejected. (Demo mode)' });
        }
        setSelectedEdit(null);
        setShowRejectModal(null);
        setRejectNotes('');
        setProcessing(null);
        setTimeout(() => setNotification(null), 3000);
    };

    const openRejectModal = (editId) => {
        setShowRejectModal(editId);
        setRejectNotes('');
    };

    const getViewMode = (editId) => viewMode[editId] || 'diff';

    const toggleViewMode = (editId) => {
        setViewMode(prev => ({
            ...prev,
            [editId]: prev[editId] === 'editor' ? 'diff' : 'editor'
        }));
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-700',
            approved: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700'
        };
        const icons = {
            pending: <Clock className="w-3 h-3" />,
            approved: <CheckCircle className="w-3 h-3" />,
            rejected: <XCircle className="w-3 h-3" />
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${styles[status]}`}>
                {icons[status]}
                {status}
            </span>
        );
    };

    const stats = [
        {
            label: 'Pending Reviews',
            value: pendingEdits.length,
            icon: Clock,
            color: 'text-yellow-600',
            bg: 'bg-yellow-100'
        },
        {
            label: 'Total Users',
            value: users.length,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-100'
        },
        {
            label: 'Total Files',
            value: files.length,
            icon: FileText,
            color: 'text-purple-600',
            bg: 'bg-purple-100'
        },
        {
            label: 'Approved Edits',
            value: allEdits.filter(e => e.status === 'approved').length,
            icon: TrendingUp,
            color: 'text-green-600',
            bg: 'bg-green-100'
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Notification Banner */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                    {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {notification.message}
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Edit</h3>
                        <p className="text-sm text-gray-600 mb-4">Provide feedback to the editor (optional):</p>
                        <textarea
                            value={rejectNotes}
                            onChange={(e) => setRejectNotes(e.target.value)}
                            placeholder="Reason for rejection..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                            rows={3}
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => { setShowRejectModal(null); setRejectNotes(''); }}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleReject(showRejectModal, rejectNotes)}
                                disabled={processing === showRejectModal}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
                            >
                                {processing === showRejectModal ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <X className="w-4 h-4" />
                                )}
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-500 mt-1">Review and approve edit requests</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                    <p className="text-xs text-gray-500">{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`pb-3 px-1 border-b-2 font-medium text-sm transition ${activeTab === 'pending'
                            ? 'border-purple-600 text-purple-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Pending Reviews ({pendingEdits.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`pb-3 px-1 border-b-2 font-medium text-sm transition ${activeTab === 'history'
                            ? 'border-purple-600 text-purple-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        All Edits ({allEdits.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`pb-3 px-1 border-b-2 font-medium text-sm transition ${activeTab === 'users'
                            ? 'border-purple-600 text-purple-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Users ({users.length})
                    </button>
                </nav>
            </div>

            {/* Content */}
            {activeTab === 'pending' && (
                <div className="space-y-4">
                    {pendingEdits.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                            <h3 className="text-lg font-semibold text-gray-900">All caught up!</h3>
                            <p className="text-gray-500 mt-1">No pending edit requests to review.</p>
                        </div>
                    ) : (
                        pendingEdits.map((edit) => (
                            <div key={edit._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                {/* Edit Header */}
                                <div
                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
                                    onClick={() => setExpandedEdit(expandedEdit === edit._id ? null : edit._id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{edit.file.name}</h3>
                                            <p className="text-sm text-gray-500">
                                                by {edit.editor.name} • {new Date(edit.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(edit.status)}
                                        {expandedEdit === edit._id ? (
                                            <ChevronUp className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {expandedEdit === edit._id && (
                                    <div className="border-t border-gray-200">
                                        {/* View Mode Toggle */}
                                        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                                            <h3 className="font-medium text-gray-700">Review Changes</h3>
                                            <div className="flex items-center bg-gray-200 rounded-lg p-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleViewMode(edit._id); }}
                                                    className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition ${getViewMode(edit._id) === 'diff'
                                                            ? 'bg-white text-purple-700 shadow-sm'
                                                            : 'text-gray-600 hover:text-gray-800'
                                                        }`}
                                                >
                                                    <GitCompare className="w-4 h-4" />
                                                    Diff View
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleViewMode(edit._id); }}
                                                    className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition ${getViewMode(edit._id) === 'editor'
                                                            ? 'bg-white text-purple-700 shadow-sm'
                                                            : 'text-gray-600 hover:text-gray-800'
                                                        }`}
                                                >
                                                    <Columns className="w-4 h-4" />
                                                    Editor & Preview
                                                </button>
                                            </div>
                                        </div>

                                        {/* Diff View */}
                                        {getViewMode(edit._id) === 'diff' && (
                                            <div className="p-4">
                                                <DiffViewer
                                                    oldContent={edit.originalContent}
                                                    newContent={edit.newContent}
                                                    oldTitle="Original Version"
                                                    newTitle="Proposed Changes"
                                                />
                                            </div>
                                        )}

                                        {/* Editor & Preview View */}
                                        {getViewMode(edit._id) === 'editor' && (
                                            <div className="p-4">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                    {/* Editor (Read-only) */}
                                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                                        <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                                                            <Edit className="w-4 h-4 text-purple-600" />
                                                            <span className="font-medium text-gray-700 text-sm">Proposed Content</span>
                                                            <span className="ml-auto text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">Read-only</span>
                                                        </div>
                                                        <textarea
                                                            readOnly
                                                            value={edit.newContent}
                                                            className="w-full h-96 p-4 font-mono text-sm resize-none focus:outline-none bg-gray-50"
                                                        />
                                                    </div>
                                                    {/* Preview */}
                                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                                        <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                                                            <Eye className="w-4 h-4 text-green-600" />
                                                            <span className="font-medium text-gray-700 text-sm">Rendered Preview</span>
                                                            <span className="ml-auto flex items-center gap-1 text-xs text-green-600">
                                                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                                Live
                                                            </span>
                                                        </div>
                                                        <div className="h-96 overflow-y-auto p-4">
                                                            <MarkdownRenderer content={edit.newContent} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                                            <button
                                                onClick={() => openRejectModal(edit._id)}
                                                disabled={processing === edit._id}
                                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <X className="w-4 h-4" />
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleApprove(edit._id)}
                                                disabled={processing === edit._id}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {processing === edit._id ? (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Check className="w-4 h-4" />
                                                )}
                                                Approve & Apply
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Editor</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {allEdits.map((edit) => (
                                <tr key={edit._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium text-gray-900">{edit.file.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{edit.editor.name}</td>
                                    <td className="px-4 py-3 text-gray-500 text-sm">
                                        {new Date(edit.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">{getStatusBadge(edit.status)}</td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => setSelectedEdit(edit)}
                                            className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${user.role === 'admin' ? 'bg-red-500' :
                                                user.role === 'editor' ? 'bg-blue-500' : 'bg-green-500'
                                                }`}>
                                                {user.name.charAt(0)}
                                            </div>
                                            <span className="font-medium text-gray-900">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${user.role === 'admin' ? 'bg-red-100 text-red-700' :
                                            user.role === 'editor' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Detail Modal */}
            {selectedEdit && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold text-gray-900">{selectedEdit.file.name}</h2>
                                <p className="text-sm text-gray-500">Edit by {selectedEdit.editor.name}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {getStatusBadge(selectedEdit.status)}
                                <button
                                    onClick={() => setSelectedEdit(null)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* View Mode Toggle for Modal */}
                        <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-center">
                            <div className="flex items-center bg-gray-200 rounded-lg p-1">
                                <button
                                    onClick={() => toggleViewMode(selectedEdit._id)}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition ${getViewMode(selectedEdit._id) === 'diff'
                                            ? 'bg-white text-purple-700 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    <GitCompare className="w-4 h-4" />
                                    Diff View
                                </button>
                                <button
                                    onClick={() => toggleViewMode(selectedEdit._id)}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition ${getViewMode(selectedEdit._id) === 'editor'
                                            ? 'bg-white text-purple-700 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    <Columns className="w-4 h-4" />
                                    Editor & Preview
                                </button>
                            </div>
                        </div>

                        <div className="p-4 overflow-y-auto max-h-[60vh]">
                            {/* Diff View in Modal */}
                            {getViewMode(selectedEdit._id) === 'diff' && (
                                <DiffViewer
                                    oldContent={selectedEdit.originalContent}
                                    newContent={selectedEdit.newContent}
                                />
                            )}

                            {/* Editor & Preview View in Modal */}
                            {getViewMode(selectedEdit._id) === 'editor' && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Editor (Read-only) */}
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                        <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                                            <Edit className="w-4 h-4 text-purple-600" />
                                            <span className="font-medium text-gray-700 text-sm">Proposed Content</span>
                                            <span className="ml-auto text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">Read-only</span>
                                        </div>
                                        <textarea
                                            readOnly
                                            value={selectedEdit.newContent}
                                            className="w-full h-80 p-4 font-mono text-sm resize-none focus:outline-none bg-gray-50"
                                        />
                                    </div>
                                    {/* Preview */}
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                        <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                                            <Eye className="w-4 h-4 text-green-600" />
                                            <span className="font-medium text-gray-700 text-sm">Rendered Preview</span>
                                            <span className="ml-auto flex items-center gap-1 text-xs text-green-600">
                                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                Live
                                            </span>
                                        </div>
                                        <div className="h-80 overflow-y-auto p-4">
                                            <MarkdownRenderer content={selectedEdit.newContent} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {selectedEdit.status === 'pending' && (
                            <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
                                <button
                                    onClick={() => openRejectModal(selectedEdit._id)}
                                    disabled={processing === selectedEdit._id}
                                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    <X className="w-4 h-4" />
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleApprove(selectedEdit._id)}
                                    disabled={processing === selectedEdit._id}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    {processing === selectedEdit._id ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Check className="w-4 h-4" />
                                    )}
                                    Approve & Apply
                                </button>
                            </div>
                        )}
                        {selectedEdit.status !== 'pending' && selectedEdit.reviewNotes && (
                            <div className="p-4 border-t border-gray-200 bg-gray-50">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Review Notes:</span> {selectedEdit.reviewNotes}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
