import { useState, useEffect } from 'react';
import {
    FileText,
    Plus,
    Edit,
    Eye,
    Send,
    Save,
    X,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';
import axios from 'axios';
import DiffViewer from '../components/DiffViewer';
import MarkdownRenderer from '../components/MarkdownRenderer';
import SyncScrollEditor from '../components/SyncScrollEditor';

export default function EditorDashboard() {
    const [files, setFiles] = useState([]);
    const [myEdits, setMyEdits] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [newFileName, setNewFileName] = useState('');
    const [newFileContent, setNewFileContent] = useState('');
    const [showDiff, setShowDiff] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('files');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [filesRes, editsRes] = await Promise.all([
                axios.get('/api/files'),
                axios.get('/api/edits/my')
            ]);
            setFiles(filesRes.data);
            setMyEdits(editsRes.data);
        } catch (error) {
            // Demo data
            setFiles([
                {
                    _id: '1',
                    name: 'README.md',
                    content: '# Welcome to MD Collab\n\nThis is a **collaborative markdown editing platform**.\n\n## Features\n\n- Role-based access control\n- Real-time markdown preview\n- GitHub-style diff viewer\n- Approval workflow\n\n## Getting Started\n\n1. Login with your credentials\n2. Navigate to your dashboard\n3. Start collaborating!',
                    author: { name: 'Admin User' },
                    status: 'approved',
                    updatedAt: new Date().toISOString()
                },
                {
                    _id: '2',
                    name: 'CONTRIBUTING.md',
                    content: '# Contributing Guidelines\n\nWe welcome contributions!\n\n## How to Contribute\n\n1. Fork the repository\n2. Create a feature branch\n3. Make your changes\n4. Submit a pull request',
                    author: { name: 'Editor User' },
                    status: 'approved',
                    updatedAt: new Date().toISOString()
                }
            ]);
            setMyEdits([
                {
                    _id: 'e1',
                    file: { name: 'README.md' },
                    status: 'pending',
                    createdAt: new Date().toISOString()
                }
            ]);
        }
        setLoading(false);
    };

    const handleStartEdit = (file) => {
        setSelectedFile(file);
        setEditContent(file.content);
        setIsEditing(true);
        setShowDiff(false);
    };

    const handleSendForApproval = async () => {
        try {
            await axios.post('/api/edits', {
                fileId: selectedFile._id,
                newContent: editContent
            });
            alert('Edit sent for approval!');
            setIsEditing(false);
            fetchData();
        } catch (error) {
            // Demo mode
            alert('Edit sent for approval! (Demo mode)');
            setIsEditing(false);
        }
    };

    const handleCreateFile = async () => {
        if (!newFileName || !newFileContent) return;

        try {
            await axios.post('/api/files', {
                name: newFileName.endsWith('.md') ? newFileName : `${newFileName}.md`,
                content: newFileContent
            });
            setIsCreating(false);
            setNewFileName('');
            setNewFileContent('');
            fetchData();
        } catch (error) {
            // Demo mode
            alert('File created successfully! (Demo mode)');
            setIsCreating(false);
            setNewFileName('');
            setNewFileContent('');
        }
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    // Create New File Modal
    if (isCreating) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Create New File</h1>
                    <button
                        onClick={() => setIsCreating(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <SyncScrollEditor
                    content={newFileContent}
                    onChange={setNewFileContent}
                    placeholder="Write your markdown content here..."
                    editorHeight="500px"
                    customEditorHeader={
                        <>
                            <Edit className="w-5 h-5 text-purple-600" />
                            <input
                                type="text"
                                placeholder="Enter filename.md"
                                value={newFileName}
                                onChange={(e) => setNewFileName(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-transparent border-none focus:outline-none focus:ring-0 font-semibold text-gray-900 flex-1 ml-1"
                            />
                        </>
                    }
                    previewTitle="Preview"
                />

                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => setIsCreating(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreateFile}
                        disabled={!newFileName || !newFileContent}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Create File
                    </button>
                </div>
            </div>
        );
    }

    // Edit Mode
    if (isEditing && selectedFile) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Editing: {selectedFile.name}</h1>
                        <p className="text-gray-500 mt-1">Make changes and send for approval</p>
                    </div>
                    <button
                        onClick={() => setIsEditing(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Toggle Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowDiff(false)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${!showDiff ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <Edit className="w-4 h-4 inline mr-2" />
                        Editor
                    </button>
                    <button
                        onClick={() => setShowDiff(true)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${showDiff ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <Eye className="w-4 h-4 inline mr-2" />
                        View Changes
                    </button>
                </div>

                {showDiff ? (
                    <DiffViewer
                        oldContent={selectedFile.content}
                        newContent={editContent}
                        oldTitle="Original"
                        newTitle="Your Changes"
                    />
                ) : (
                    <SyncScrollEditor
                        content={editContent}
                        onChange={setEditContent}
                        placeholder="Write your markdown content here..."
                        editorHeight="500px"
                        editorTitle="Markdown Editor"
                        previewTitle="Live Preview"
                    />
                )}

                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSendForApproval}
                        disabled={editContent === selectedFile.content}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        Send for Approval
                    </button>
                </div>
            </div>
        );
    }

    // Main Dashboard
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Editor Dashboard</h1>
                    <p className="text-gray-500 mt-1">Create and edit markdown files</p>
                </div>

                <button
                    onClick={() => setIsCreating(true)}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Create New File
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('files')}
                        className={`pb-3 px-1 border-b-2 font-medium text-sm transition ${activeTab === 'files'
                            ? 'border-purple-600 text-purple-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        All Files ({files.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('edits')}
                        className={`pb-3 px-1 border-b-2 font-medium text-sm transition ${activeTab === 'edits'
                            ? 'border-purple-600 text-purple-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        My Edits ({myEdits.length})
                    </button>
                </nav>
            </div>

            {activeTab === 'files' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {files.map((file) => (
                        <div
                            key={file._id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">{file.name}</h3>
                                        <p className="text-xs text-gray-500">{file.author?.name}</p>
                                    </div>
                                </div>
                                {getStatusBadge(file.status)}
                            </div>

                            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                {file.content.substring(0, 100)}...
                            </p>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedFile(file)}
                                    className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-1"
                                >
                                    <Eye className="w-4 h-4" />
                                    View
                                </button>
                                <button
                                    onClick={() => handleStartEdit(file)}
                                    className="flex-1 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-1"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="divide-y divide-gray-100">
                        {myEdits.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No edits yet. Start editing a file!</p>
                            </div>
                        ) : (
                            myEdits.map((edit) => (
                                <div key={edit._id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{edit.file?.name}</h3>
                                            <p className="text-xs text-gray-500">
                                                Submitted {new Date(edit.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    {getStatusBadge(edit.status)}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Quick Preview Modal */}
            {selectedFile && !isEditing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="font-semibold text-gray-900">{selectedFile.name}</h2>
                            <button
                                onClick={() => setSelectedFile(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            <MarkdownRenderer content={selectedFile.content} />
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedFile(null)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleStartEdit(selectedFile)}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Edit This File
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
