import { useForm, usePage } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function UpdateProfileInformationForm({ mustVerifyEmail, status, className = '' }) {
    const { props } = usePage();
    const user = props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name || '',
        email: user.email || '',
        about_car: user.about_car || '',
        car_number: user.car_number || '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">プロフィール情報</h2>
                <p className="mt-1 text-sm text-gray-600">
                    アカウントのプロフィール情報を更新できます。
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                {/* 名前 */}
                <div>
                    <InputLabel htmlFor="name" value="名前" />
                    <TextInput
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="mt-1 block w-full"
                        required
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                {/* メールアドレス */}
                <div>
                    <InputLabel htmlFor="email" value="メールアドレス" />
                    <TextInput
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="mt-1 block w-full"
                        required
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                {/* 車について */}
                <div>
                    <InputLabel htmlFor="about_car" value="車の説明" />
                    <TextInput
                        id="about_car"
                        value={data.about_car}
                        onChange={(e) => setData('about_car', e.target.value)}
                        className="mt-1 block w-full"
                    />
                    <InputError className="mt-2" message={errors.about_car} />
                </div>

                {/* 車の番号 */}
                <div>
                    <InputLabel htmlFor="car_number" value="車の番号" />
                    <TextInput
                        id="car_number"
                        type="string"
                        value={data.car_number}
                        onChange={(e) => setData('car_number', e.target.value)}
                        className="mt-1 block w-full"
                    />
                    <InputError className="mt-2" message={errors.car_number} />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>保存</PrimaryButton>
                    {recentlySuccessful && (
                        <p className="text-sm text-gray-600">保存しました。</p>
                    )}
                </div>
            </form>
        </section>
    );
}
