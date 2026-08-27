import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, KeyRound, UserRound } from 'lucide-react';
import AuthShell from './AuthShell';
import { roleLabels } from '../../domain/types';
import { useApp } from '../../store';

/** The four seeded walkthrough identities, one per role. */
const DEMO_IDS = ['m-1', 'm-2', 'm-3', 'v-1'];

export default function Login() {
  const { state, dispatch } = useApp();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [hint, setHint] = useState<string | null>(null);

  /* Signing in flips `authed`; visiting /login while signed in is pointless. */
  if (state.authed) return <Navigate to="/" replace />;

  const demoMembers = DEMO_IDS
    .map((id) => state.members.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  function submit() {
    const v = account.trim();
    if (!v) { setHint('请输入工号、邮箱或手机号'); return; }
    if (!password) { setHint('请输入密码'); return; }
    setHint(null);
    const m = state.members.find(
      (x) => x.employeeNo === v || x.email.toLowerCase() === v.toLowerCase() || x.phone === v || x.name === v,
    );
    if (!m) {
      setHint('账号不存在——可检查输入，或使用下方演示账号一键登录');
      return;
    }
    dispatch({ type: 'LOGIN', memberId: m.id });
  }

  return (
    <AuthShell>
      <h1 className="text-[20px] font-extrabold tracking-[-0.02em] text-text">登录</h1>
      <p className="text-[13px] text-text-muted mt-1.5">
        使用企业为你开通的账号登录，不同角色将看到各自职责内的功能与数据
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <label className="block">
          <span className="block text-[13px] font-medium text-text-secondary mb-1.5">账号</span>
          <div className="relative">
            <UserRound size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-placeholder" />
            <input
              className="field w-full h-[38px] pl-10 pr-4 text-[14px]"
              placeholder="工号 / 邮箱 / 手机号，如 YG0001"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              autoFocus
            />
          </div>
        </label>

        <label className="block">
          <span className="block text-[13px] font-medium text-text-secondary mb-1.5">密码</span>
          <div className="relative">
            <KeyRound size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-placeholder" />
            <input
              type="password"
              className="field w-full h-[38px] pl-10 pr-4 text-[14px]"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
          </div>
        </label>

        {hint && <p className="text-[13px] text-warning font-medium -mt-1">{hint}</p>}

        <button onClick={submit} className="btn-primary w-full h-[38px] text-[13.5px] font-semibold cursor-pointer">
          登 录
        </button>
      </div>

      <p className="text-[13px] text-text-muted text-center mt-7">
        还没有账号？
        <Link to="/register" className="text-primary font-medium hover:underline ml-1 inline-flex items-center gap-0.5">
          注册加入企业 <ArrowRight size={13} />
        </Link>
      </p>

      {/* Walkthrough entry, deliberately whispered: one muted footnote line
          instead of the old card grid, so the page reads as a real product
          while reviewers can still hop between the four roles in one click. */}
      <p className="text-[12px] text-text-placeholder text-center mt-6 select-none">
        演示：
        {demoMembers.map((m, i) => (
          <span key={m.id}>
            {i > 0 && <span className="mx-1">·</span>}
            <button
              onClick={() => dispatch({ type: 'LOGIN', memberId: m.id })}
              className="hover:text-primary transition-colors cursor-pointer"
              title={roleLabels[m.role]}
            >
              {m.name}
            </button>
          </span>
        ))}
      </p>
    </AuthShell>
  );
}
