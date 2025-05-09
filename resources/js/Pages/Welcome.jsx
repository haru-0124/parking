import { Link, Head } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center text-center p-6">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">ようこそ！</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                このアプリは、自分が駐車した場所を記録し、現在の駐車料金や今後の料金変動をリアルタイムで確認できるアプリです。
                </p>

                <div className="space-x-4">
                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            ダッシュボードへ
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route('login')}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                ログイン
                            </Link>
                            <Link
                                href={route('register')}
                                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                            >
                                新規登録
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
