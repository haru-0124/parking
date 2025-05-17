import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        about_car: '',
        car_number: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit}>
                {/* 名前 */}
                <div>
                    <InputLabel htmlFor="name" value="名前" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                {/* メール */}
                <div className="mt-4">
                    <InputLabel htmlFor="email" value="メールアドレス" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* パスワード */}
                <div className="mt-4">
                    <InputLabel htmlFor="password" value="パスワード" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* パスワード確認 */}
                <div className="mt-4">
                    <InputLabel htmlFor="password_confirmation" value="パスワード(確認)" />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />

                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                {/* 車の説明 */}
                <div className="mt-4">
                    <InputLabel htmlFor="about_car" value="車の説明(空欄可)" />

                    <TextInput
                        id="about_car"
                        name="about_car"
                        value={data.about_car}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('about_car', e.target.value)}
                    />

                    <InputError message={errors.about_car} className="mt-2" />
                </div>

                {/* 車のナンバー */}
                <div className="mt-4">
                    <InputLabel htmlFor="car_number" value="車の番号(空欄可)" />

                    <TextInput
                        id="car_number"
                        name="car_number"
                        type="text"
                        value={data.car_number}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('car_number', e.target.value)}
                    />

                    <InputError message={errors.car_number} className="mt-2" />
                </div>

                {/* ボタン */}
                <div className="flex items-center justify-end mt-4">
                    <Link
                        href={route('login')}
                        className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        既に登録している場合
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing}>
                        新規登録
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
