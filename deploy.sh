#!/bin/bash

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

GHCR_USERNAME="${GHCR_USERNAME:-hyunjoonkwak}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
COMPOSE_FILE="docker-compose.prod.yml"

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

print_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

check_env() {
    if [ ! -f "$SCRIPT_DIR/.env" ]; then
        print_warning ".env 파일이 없습니다. .env.example을 복사합니다."
        if [ -f "$SCRIPT_DIR/.env.example" ]; then
            cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
            print_info ".env 파일을 생성했습니다. API 키와 비밀번호를 설정해주세요."
            print_error "설정 후 다시 실행하세요."
            exit 1
        else
            print_error ".env.example 파일도 없습니다."
            exit 1
        fi
    fi

    # 필수 환경변수 확인
    source "$SCRIPT_DIR/.env"
    if [ -z "$POSTGRES_PASSWORD" ] || [ "$POSTGRES_PASSWORD" = "your_secure_password_here" ]; then
        print_error "POSTGRES_PASSWORD를 .env 파일에서 설정해주세요."
        exit 1
    fi
}

ghcr_login() {
    print_header "GHCR 로그인"

    echo -e "${YELLOW}GitHub Personal Access Token이 필요합니다.${NC}"
    echo ""

    read -p "GitHub 사용자명 [$GHCR_USERNAME]: " input_username
    GHCR_USERNAME="${input_username:-$GHCR_USERNAME}"

    echo -e "${YELLOW}토큰을 입력하세요:${NC}"
    read -s token
    echo ""

    echo "$token" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin

    if [ $? -eq 0 ]; then
        print_success "GHCR 로그인 성공!"
    else
        print_error "GHCR 로그인 실패"
        exit 1
    fi
}

pull_images() {
    print_header "GHCR 이미지 풀"

    local username=$(echo "$GHCR_USERNAME" | tr '[:upper:]' '[:lower:]')

    echo -e "${YELLOW}GHCR 사용자: ${username}${NC}"
    echo -e "${YELLOW}이미지 태그: ${IMAGE_TAG}${NC}"
    echo ""

    print_info "Backend 이미지 풀 중..."
    docker pull ghcr.io/${username}/detailpage-backend:${IMAGE_TAG}

    print_info "Frontend 이미지 풀 중..."
    docker pull ghcr.io/${username}/detailpage-frontend:${IMAGE_TAG}

    print_success "이미지 풀 완료!"
}

deploy() {
    print_header "Detailpage Maker 배포"
    check_env

    local username=$(echo "$GHCR_USERNAME" | tr '[:upper:]' '[:lower:]')

    print_info "기존 컨테이너 중지 중..."
    GHCR_USERNAME=${username} IMAGE_TAG=${IMAGE_TAG} docker-compose -f ${COMPOSE_FILE} down || true

    print_info "컨테이너 시작 중..."
    GHCR_USERNAME=${username} IMAGE_TAG=${IMAGE_TAG} docker-compose -f ${COMPOSE_FILE} up -d

    print_success "배포 완료!"
    echo ""
    status
    healthcheck 20 3
}

update() {
    print_header "Detailpage Maker 업데이트"

    pull_images
    echo ""
    deploy
}

start() {
    print_header "Detailpage Maker 시작"
    check_env

    local username=$(echo "$GHCR_USERNAME" | tr '[:upper:]' '[:lower:]')

    GHCR_USERNAME=${username} IMAGE_TAG=${IMAGE_TAG} docker-compose -f ${COMPOSE_FILE} up -d

    print_success "시작 완료!"
    status
    healthcheck 20 3
}

stop() {
    print_header "Detailpage Maker 중지"

    local username=$(echo "$GHCR_USERNAME" | tr '[:upper:]' '[:lower:]')

    GHCR_USERNAME=${username} IMAGE_TAG=${IMAGE_TAG} docker-compose -f ${COMPOSE_FILE} stop

    print_success "중지 완료!"
}

restart() {
    print_header "Detailpage Maker 재시작"

    local username=$(echo "$GHCR_USERNAME" | tr '[:upper:]' '[:lower:]')

    GHCR_USERNAME=${username} IMAGE_TAG=${IMAGE_TAG} docker-compose -f ${COMPOSE_FILE} restart

    print_success "재시작 완료!"
    status
}

status() {
    print_header "Detailpage Maker 상태"

    local username=$(echo "$GHCR_USERNAME" | tr '[:upper:]' '[:lower:]')

    GHCR_USERNAME=${username} IMAGE_TAG=${IMAGE_TAG} docker-compose -f ${COMPOSE_FILE} ps

    echo ""
    local port="${HTTP_PORT:-8080}"
    local ip=$(hostname -I 2>/dev/null | awk '{print $1}' || echo 'localhost')
    echo -e "${BLUE}접속 URL:${NC}"
    echo "  http://${ip}:${port}"
}

healthcheck() {
    local max_attempts=${1:-20}
    local wait_seconds=${2:-3}

    # .env에서 포트 로드
    if [ -f "$SCRIPT_DIR/.env" ]; then
        source "$SCRIPT_DIR/.env"
    fi
    local port="${HTTP_PORT:-8080}"

    if ! command -v curl &> /dev/null; then
        print_warning "curl이 설치되어 있지 않아 헬스체크를 건너뜁니다."
        return 0
    fi

    print_info "헬스체크 중... (최대 ${max_attempts}회 시도, ${wait_seconds}초 간격)"

    for i in $(seq 1 $max_attempts); do
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:${port}/health 2>/dev/null || echo "000")

        if [ "$HTTP_STATUS" = "200" ]; then
            print_success "애플리케이션이 정상 응답합니다. (HTTP $HTTP_STATUS)"
            return 0
        fi

        if [ $i -lt $max_attempts ]; then
            echo -ne "\r  시도 $i/$max_attempts - 대기 중... (HTTP $HTTP_STATUS)"
            sleep $wait_seconds
        fi
    done

    echo ""
    print_warning "애플리케이션이 아직 준비되지 않았습니다. (HTTP $HTTP_STATUS)"
    print_info "잠시 후 다시 확인하거나 '$0 logs'로 로그를 확인하세요."
    return 1
}

logs() {
    local service=$1
    local username=$(echo "$GHCR_USERNAME" | tr '[:upper:]' '[:lower:]')

    if [ -z "$service" ]; then
        print_header "전체 로그"
        GHCR_USERNAME=${username} IMAGE_TAG=${IMAGE_TAG} docker-compose -f ${COMPOSE_FILE} logs -f --tail=100
    else
        print_header "$service 로그"
        GHCR_USERNAME=${username} IMAGE_TAG=${IMAGE_TAG} docker-compose -f ${COMPOSE_FILE} logs -f --tail=100 "$service"
    fi
}

clean() {
    print_header "Docker 정리"

    local username=$(echo "$GHCR_USERNAME" | tr '[:upper:]' '[:lower:]')

    print_warning "컨테이너 삭제 중..."
    GHCR_USERNAME=${username} IMAGE_TAG=${IMAGE_TAG} docker-compose -f ${COMPOSE_FILE} down -v || true

    print_warning "사용하지 않는 이미지 삭제 중..."
    docker image prune -f

    print_success "정리 완료!"
}

backup_db() {
    print_header "데이터베이스 백업"

    local username=$(echo "$GHCR_USERNAME" | tr '[:upper:]' '[:lower:]')
    local backup_dir="$SCRIPT_DIR/backups"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$backup_dir/detailpage_${timestamp}.sql"

    mkdir -p "$backup_dir"

    # .env에서 DB 정보 로드
    if [ -f "$SCRIPT_DIR/.env" ]; then
        source "$SCRIPT_DIR/.env"
    fi

    print_info "백업 파일: $backup_file"

    GHCR_USERNAME=${username} IMAGE_TAG=${IMAGE_TAG} docker-compose -f ${COMPOSE_FILE} exec -T db \
        pg_dump -U "${POSTGRES_USER:-admin}" "${POSTGRES_DB:-detailpage}" > "$backup_file"

    if [ $? -eq 0 ]; then
        print_success "백업 완료: $backup_file"
    else
        print_error "백업 실패"
        exit 1
    fi
}

show_help() {
    echo -e "${GREEN}Detailpage Maker NAS 배포 스크립트${NC}"
    echo ""
    echo -e "${YELLOW}사용법:${NC}"
    echo "  $0 <명령어> [옵션]"
    echo ""
    echo -e "${BLUE}=== 배포 ===${NC}"
    echo -e "  ${GREEN}login${NC}            GHCR 로그인 (최초 1회)"
    echo -e "  ${GREEN}pull${NC}             GHCR에서 최신 이미지 풀"
    echo -e "  ${GREEN}deploy${NC}           컨테이너 배포"
    echo -e "  ${GREEN}update${NC}           풀 + 배포 (추천)"
    echo ""
    echo -e "${BLUE}=== 관리 ===${NC}"
    echo -e "  ${GREEN}start${NC}            서비스 시작"
    echo -e "  ${GREEN}stop${NC}             서비스 중지"
    echo -e "  ${GREEN}restart${NC}          서비스 재시작"
    echo -e "  ${GREEN}status${NC}           서비스 상태"
    echo -e "  ${GREEN}logs [service]${NC}   로그 확인 (backend/frontend/db/nginx)"
    echo -e "  ${GREEN}health${NC}           헬스체크"
    echo ""
    echo -e "${BLUE}=== 유지보수 ===${NC}"
    echo -e "  ${GREEN}backup${NC}           데이터베이스 백업"
    echo -e "  ${GREEN}clean${NC}            Docker 정리"
    echo ""
    echo -e "${YELLOW}환경변수:${NC}"
    echo "  GHCR_USERNAME    GitHub 사용자명 (기본: hyunjoonkwak)"
    echo "  IMAGE_TAG        이미지 태그 (기본: latest)"
    echo ""
    echo -e "${YELLOW}예시:${NC}"
    echo "  $0 login                    # GHCR 로그인"
    echo "  $0 update                   # 최신 이미지로 업데이트"
    echo "  IMAGE_TAG=v1.0.0 $0 update  # 특정 버전으로 업데이트"
    echo "  $0 logs backend             # 백엔드 로그 확인"
    echo "  $0 backup                   # 데이터베이스 백업"
}

case "${1:-help}" in
    login)
        ghcr_login
        ;;
    pull)
        pull_images
        ;;
    deploy)
        deploy
        ;;
    update)
        update
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    logs)
        logs "$2"
        ;;
    health|healthcheck)
        healthcheck 20 3
        ;;
    backup)
        backup_db
        ;;
    clean)
        clean
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "알 수 없는 명령어: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
